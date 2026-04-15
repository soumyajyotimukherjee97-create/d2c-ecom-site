'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireStaff } from '@/lib/actions/auth-guard'
import {
  CreateProductSchema,
  UpdateProductSchema,
  UpdateVariantSchema,
  VariantInputSchema,
  type CreateProductInput,
  type UpdateProductInput,
  type UpdateVariantInput,
  type VariantInput,
} from '@/lib/api/schemas/products'

// ─── Result shape returned to client components ──────────────────────────────

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; code: 'VALIDATION_ERROR' | 'CONFLICT' | 'NOT_FOUND' | 'INTERNAL'; message: string; fieldErrors?: Record<string, string[]> }

// ─── Create product (+ first variant) ────────────────────────────────────────

export async function createProductAction(
  input: CreateProductInput,
): Promise<ActionResult<{ id: string }>> {
  await requireStaff()

  const parsed = CreateProductSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok:           false,
      code:         'VALIDATION_ERROR',
      message:      'Please fix the highlighted fields.',
      fieldErrors:  parsed.error.flatten().fieldErrors,
    }
  }

  const { name, slug, description, category, skin_types, concerns, image_url, variants } =
    parsed.data

  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existing) {
    return {
      ok:      false,
      code:    'CONFLICT',
      message: `A product with slug "${slug}" already exists.`,
    }
  }

  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({
      name,
      slug,
      description: description ?? null,
      category,
      skin_types,
      concerns,
      image_url:   image_url ?? null,
    })
    .select('id')
    .single()

  if (productError || !product) {
    console.error('[createProductAction] insert product', productError?.message)
    return { ok: false, code: 'INTERNAL', message: 'Failed to create product.' }
  }

  const { error: variantsError } = await supabase
    .from('product_variants')
    .insert(variants.map((v) => ({ ...v, product_id: product.id as string })))

  if (variantsError) {
    console.error('[createProductAction] insert variants', variantsError.message)
    // Roll back the orphan product so the admin can retry with the same slug.
    await supabase.from('products').delete().eq('id', product.id as string)
    return {
      ok:      false,
      code:    variantsError.code === '23505' ? 'CONFLICT' : 'INTERNAL',
      message:
        variantsError.code === '23505'
          ? 'One of the variant SKUs already exists. Pick a unique SKU per variant.'
          : 'Failed to create variants.',
    }
  }

  revalidatePath('/products')
  return { ok: true, data: { id: product.id as string } }
}

// ─── Update product details ──────────────────────────────────────────────────

export async function updateProductAction(
  id: string,
  input: UpdateProductInput,
): Promise<ActionResult> {
  await requireStaff()

  const parsed = UpdateProductSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok:          false,
      code:        'VALIDATION_ERROR',
      message:     'Please fix the highlighted fields.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = createAdminClient()
  const { error, data } = await supabase
    .from('products')
    .update(parsed.data)
    .eq('id', id)
    .select('id')
    .maybeSingle()

  if (error) {
    console.error('[updateProductAction]', error.message)
    return { ok: false, code: 'INTERNAL', message: 'Failed to update product.' }
  }
  if (!data) {
    return { ok: false, code: 'NOT_FOUND', message: 'Product not found.' }
  }

  revalidatePath('/products')
  revalidatePath(`/products/${id}/edit`)
  return { ok: true, data: undefined }
}

// ─── Toggle active (soft delete) ─────────────────────────────────────────────

export async function toggleProductActiveAction(
  id: string,
  nextActive: boolean,
): Promise<ActionResult> {
  return updateProductAction(id, { is_active: nextActive })
}

// ─── Add variant to existing product ─────────────────────────────────────────

export async function addVariantAction(
  productId: string,
  input: VariantInput,
): Promise<ActionResult<{ id: string }>> {
  await requireStaff()

  const parsed = VariantInputSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok:          false,
      code:        'VALIDATION_ERROR',
      message:     'Please fix the highlighted fields.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('product_variants')
    .insert({ ...parsed.data, product_id: productId })
    .select('id')
    .single()

  if (error) {
    console.error('[addVariantAction]', error.message)
    if (error.code === '23505') {
      return { ok: false, code: 'CONFLICT', message: 'That SKU is already in use.' }
    }
    return { ok: false, code: 'INTERNAL', message: 'Failed to add variant.' }
  }

  revalidatePath(`/products/${productId}/edit`)
  return { ok: true, data: { id: data!.id as string } }
}

// ─── Update existing variant ─────────────────────────────────────────────────

export async function updateVariantAction(
  productId: string,
  variantId: string,
  input: UpdateVariantInput,
): Promise<ActionResult> {
  await requireStaff()

  const parsed = UpdateVariantSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok:          false,
      code:        'VALIDATION_ERROR',
      message:     'Please fix the highlighted fields.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = createAdminClient()
  const { error, data } = await supabase
    .from('product_variants')
    .update(parsed.data)
    .eq('id', variantId)
    .eq('product_id', productId)
    .select('id')
    .maybeSingle()

  if (error) {
    console.error('[updateVariantAction]', error.message)
    return { ok: false, code: 'INTERNAL', message: 'Failed to update variant.' }
  }
  if (!data) {
    return { ok: false, code: 'NOT_FOUND', message: 'Variant not found.' }
  }

  revalidatePath(`/products/${productId}/edit`)
  return { ok: true, data: undefined }
}

// ─── Form-submit convenience wrappers (used by <form action={...}>) ──────────
// These throw/redirect; they do not return a result object.

export async function createProductFormAction(input: CreateProductInput): Promise<void> {
  const result = await createProductAction(input)
  if (!result.ok) {
    // Throwing inside a server action surfaces as a generic error to the client.
    // We use the ActionResult-returning entry points from client components instead.
    throw new Error(result.message)
  }
  redirect(`/products/${result.data.id}/edit?created=1`)
}
