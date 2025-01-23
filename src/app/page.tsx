'use client'
import { NavBar } from "@/components/NavBar/NavBar";
import { withAuth } from "@/components/WithAuth/WithAuth";

function HomePage() {
  return (
    <>
      <NavBar />
    </>
  );
}

export default withAuth(HomePage); // Wrapping the component with the HOC
