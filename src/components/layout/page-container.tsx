import { MainNavigation } from './main-navigation';

type PageContainerProps = {
  children: React.ReactNode;
  title?: string;
};

export function PageContainer({ children, title }: PageContainerProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <MainNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && (
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>
        )}
        {children}
      </main>
    </div>
  );
}