import { EconomicCalendar } from '../../components/tools/EconomicCalendar';

export const EconomicCalendarPage = () => {
  return (
    <div className="animate-fade-in w-full">
      <div className="mb-8">
        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
          Economic <span className="text-accent">Calendar</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Stay ahead of the markets by tracking key economic events, central bank announcements, and global financial indicators.
        </p>
      </div>
      <EconomicCalendar />
    </div>
  );
};
