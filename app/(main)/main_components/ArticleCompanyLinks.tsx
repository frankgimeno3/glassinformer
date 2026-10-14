import Link from "next/link";

interface Props {
  company?: string;
  names?: string[];
  ids?: string[];
  className?: string;
}

export default function ArticleCompanyLinks({ company, names, ids, className }: Props) {
  const labels = names?.length ? names : company ? [company] : [];
  return <>{labels.map((name, index) => (
    <span key={`${name}-${index}`}>
      {index > 0 && ", "}
      {ids?.[index] ? (
        <Link href={`/directory/companies/${encodeURIComponent(ids[index])}`} className={className} onClick={(event) => event.stopPropagation()}>{name}</Link>
      ) : <span className={className}>{name}</span>}
    </span>
  ))}</>;
}
