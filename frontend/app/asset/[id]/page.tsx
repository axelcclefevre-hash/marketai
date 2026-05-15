import AssetClient from "@/components/pages/AssetClient";
export default function AssetPage({ params }: { params: { id: string } }) {
  return <AssetClient assetName={decodeURIComponent(params.id)} />;
}
