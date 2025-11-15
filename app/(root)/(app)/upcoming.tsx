import { View, ActivityIndicator } from 'react-native';
import { AgendaList, CalendarProvider, ExpandableCalendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { useMemo, useCallback } from 'react';

import { useAuthStore } from '@/store/auth-store';
import { useUpcomingTasksQuery } from '@/features/tasks/queries/use-upcoming-tasks';
import { TaskCard } from '@/features/tasks/components/task-card';
import { useAppTheme } from '@/contexts/app-theme-contexts';
import { useThemeColor } from 'heroui-native';

export default function UpcomingScreen() {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const backgroundColor = useThemeColor('background');
  const foregroundColor = useThemeColor('foreground');
  const mutedColor = useThemeColor('muted');

  const { user } = useAuthStore((state) => ({ user: state.user }));
  const { data: tasks = [], isLoading } = useUpcomingTasksQuery({ createdBy: user?.id });

  // Get today's date in YYYY-MM-DD format for minDate
  const today = useMemo(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }, []);

  // Transform tasks into sections format for AgendaList: [{ title: 'date', data: [tasks] }]
  const sections = useMemo(() => {
    const groupedByDate: { [date: string]: any[] } = {};

    // Group tasks by date
    for (const task of tasks) {
      if (!task.due_at) continue;
      const dateKey = task.due_at.split('T')[0];
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(task);
    }

    // Convert to sections array format and sort by date
    return Object.keys(groupedByDate)
      .sort()
      .map((date) => ({
        title: date,
        data: groupedByDate[date],
      }));
  }, [tasks]);

  // Mark dates that have tasks
  const markedDates = useMemo(() => {
    const marked: { [key: string]: { marked: boolean; dotColor?: string } } = {};

    sections.forEach((section) => {
      marked[section.title] = {
        marked: true,
        dotColor: isDark ? '#60a5fa' : '#3b82f6',
      };
    });

    return marked;
  }, [sections, isDark]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      return (
        <View className="mb-3 px-4">
          <TaskCard task={item} onPress={(task) => router.push(`/task/${task.id}`)} />
        </View>
      );
    },
    [router]
  );

  const calendarTheme = useMemo(
    () => ({
      backgroundColor: backgroundColor,
      calendarBackground: backgroundColor,
      textSectionTitleColor: foregroundColor,
      selectedDayBackgroundColor: isDark ? '#3b82f6' : '#2563eb',
      selectedDayTextColor: '#ffffff',
      todayTextColor: isDark ? '#60a5fa' : '#3b82f6',
      dayTextColor: foregroundColor,
      textDisabledColor: mutedColor,
      dotColor: isDark ? '#60a5fa' : '#3b82f6',
      selectedDotColor: '#ffffff',
      arrowColor: foregroundColor,
      monthTextColor: foregroundColor,
      indicatorColor: foregroundColor,
      textDayFontFamily: 'System',
      textMonthFontFamily: 'System',
      textDayHeaderFontFamily: 'System',
      textDayFontWeight: '400' as const,
      textMonthFontWeight: '600' as const,
      textDayHeaderFontWeight: '400' as const,
      textDayFontSize: 16,
      textMonthFontSize: 18,
      textDayHeaderFontSize: 13,
    }),
    [backgroundColor, foregroundColor, mutedColor, isDark]
  );

  if (isLoading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="bg-background flex-1" style={{ paddingTop: 120 }}>
      <CalendarProvider
        date={today}
        showTodayButton={true}
        theme={{
          todayButtonTextColor: isDark ? '#60a5fa' : '#3b82f6',
        }}>
        <ExpandableCalendar
          key={`calendar-${Object.keys(markedDates).length}`}
          firstDay={0}
          markedDates={markedDates}
          theme={calendarTheme}
          disableAllTouchEventsForDisabledDays
          minDate={today}
          hideArrows
        />
        <AgendaList
          sections={sections}
          renderItem={renderItem}
          sectionStyle={{
            backgroundColor: backgroundColor,
            paddingTop: 16,
            paddingBottom: 8,
            paddingHorizontal: 16,
          }}
        />
      </CalendarProvider>
    </View>
  );
}
