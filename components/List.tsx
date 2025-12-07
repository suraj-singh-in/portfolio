// components/List.tsx
"use client";

interface ListProps {
  items: (string | React.ReactElement)[]; 
  ordered?: boolean;
}

export default function List({ items, ordered = false }: ListProps) {
  const Wrapper = ordered ? "ol" : "ul";

  return (
    <Wrapper className="list-disc pl-6 space-y-1 text-neutral-700 dark:text-neutral-300">
      {items.map((item, idx) => (
        <li key={idx} className="leading-relaxed">
          {item}
        </li>
      ))}
    </Wrapper>
  );
}
