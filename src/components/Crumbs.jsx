/** Пътечка на отделните страници: Начало / [родител /] текуща. */
export default function Crumbs({ label, parent }) {
  return (
    <nav className="anima-crumbs" aria-label="Пътечка">
      <a href="/">Начало</a>
      <span aria-hidden="true">/</span>
      {parent && (
        <>
          <a href={parent.href}>{parent.label}</a>
          <span aria-hidden="true">/</span>
        </>
      )}
      <span aria-current="page">{label}</span>
    </nav>
  );
}
