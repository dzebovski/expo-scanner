import HomeScreen from "@/components/HomeScreen";

export default function HomePage() {
  return (
    <div className="w-full max-w-md mx-auto h-[100dvh] bg-slate-50 overflow-hidden flex flex-col font-sans relative shadow-2xl sm:rounded-[2.5rem] sm:h-[850px] sm:my-8 border border-slate-200">
      <HomeScreen />
    </div>
  );
}
