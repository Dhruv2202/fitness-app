import { SkeletonList } from "@/components/Skeleton";

export default function Loading() {
  return <SkeletonList title="products" count={4} />;
}
