import { TrendingUp } from 'lucide-react';

export default function Header() {
  return (
    <header className="py-8">
      <div className="container mx-auto flex items-center gap-4">
        <TrendingUp className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold font-headline tracking-tight text-foreground">
          Credit Foresight
        </h1>
      </div>
    </header>
  );
}
