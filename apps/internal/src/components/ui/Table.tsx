export function Th({ children, className = '', ...rest }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`text-left px-4 py-3 font-mono text-2xs uppercase tracking-wider text-gray-600 ${className}`} {...rest}>
      {children}
    </th>
  )
}

export function Td({ children, className = '', ...rest }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-4 py-3 font-body text-sm text-gray-900 ${className}`} {...rest}>
      {children}
    </td>
  )
}
