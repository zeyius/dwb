// SOLD takes precedence over NEW.
export default function ProductBadge({ product }) {
  if (product.is_sold) return <span className="badge badge-sold">SOLD</span>
  if (product.is_new) return <span className="badge">NEW</span>
  return null
}
