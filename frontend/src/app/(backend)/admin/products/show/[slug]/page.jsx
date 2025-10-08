import ShowPage from "./show-page";

export default function Page({ params }) {
  return <ShowPage slug={params.slug} />
}