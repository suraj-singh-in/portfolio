import Link from "next/link";

export interface IList {
  sections: { title: string; items: { title: string; url: string }[] }[];
}
export interface ListingComponentProps {
  list: IList;
}

const Listing = ({ list }: ListingComponentProps) => {
  return list.sections.map((section) => (
    <div key={section.title} className="flex flex-col">
      <div className="flex justify-between items-baseline mb-2">
        <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">{section.title}</h2>
      </div>

      <ul className="list-disc pl-5 space-y-2 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm">
        {section.items.map((item) => {
          const isExternal = item.url.startsWith("http");
          return (
            <li key={item.url} className="font-medium">
              {isExternal ? (
                <a href={item.url} className="underline" target="_blank" rel="noreferrer">
                  {item.title}
                </a>
              ) : (
                <Link href={item.url} className="underline">
                  {item.title}
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      {/* divider between sections */}
      <hr className="my-4 border-neutral-100 dark:border-neutral-800" />
    </div>
  ));
};

export default Listing;
