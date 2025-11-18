import type { Metadata } from "next";
import HomePage from "@/components/home/HomePage";

export const metadata: Metadata = {
  title: 'CarTribe - Find Your Perfect Ride',
  description: 'Explore the world\'s largest car sharing marketplace. Find and book your perfect vehicle today.',
};

export default function Home() {
  return <HomePage />;
}
