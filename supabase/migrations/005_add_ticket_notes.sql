-- Internal notes on support tickets.
-- Staff-only field captured on PATCH /api/support/[id] (internal platform).
-- Never surfaced on the public customer site.
ALTER TABLE support_tickets
  ADD COLUMN notes text;
