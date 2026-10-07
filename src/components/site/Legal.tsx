import { PageHeader } from "./PageHeader";

export function Legal({ title, sections }: { title: string; sections: [string, string][] }) {
  return (
    <>
      <PageHeader eyebrow="Policies" title={title}>
        Last updated October 2026.
      </PageHeader>
      <div className="container-x max-w-3xl space-y-8 py-12">
        {sections.map(([h, b]) => (
          <section key={h}>
            <h2 className="font-display text-2xl">{h}</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{b}</p>
          </section>
        ))}
      </div>
    </>
  );
}
