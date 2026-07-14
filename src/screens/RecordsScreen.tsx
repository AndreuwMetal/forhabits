import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MonthCalendar, { MonthCalendarRef } from '../components/MonthCalendar';
import HabitForm from '../components/HabitForm';
import HeroCard from '../components/HeroCard';
import HabitsLegendModal from '../components/HabitsLegendModal';
import DailyLogHistorySheet from '../components/DailyLogHistorySheet';
import AnalysisSheet, { AnalysisRequest } from '../components/AnalysisSheet';
import MonthView from './MonthView';
import DayView from './DayView';
import { useStore } from '../store';
import { useI18n } from '../i18n';
import { theme } from '../theme';
import { fromKey, startOfMonth, toKey } from '../types';

type ViewState =
  | { kind: 'list' }
  | { kind: 'month'; month: Date }
  | { kind: 'day'; dateKey: string };

export default function RecordsScreen() {
  const { habits, logs, firstUse, addHabit, updateHabit, removeHabit, saveDayLog } =
    useStore();
  const { lang, t } = useI18n();
  const calRef = useRef<MonthCalendarRef>(null);
  const [legendVisible, setLegendVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [analysisReq, setAnalysisReq] = useState<AnalysisRequest | null>(null);
  const [view, setView] = useState<ViewState>({ kind: 'list' });

  const firstUseDate = new Date(firstUse);
  const minDateKey = toKey(firstUseDate);

  // Today: lista → mes actual ampliado → día de hoy (y desde día, salta a hoy)
  const onToday = () => {
    if (view.kind === 'list') {
      setView({ kind: 'month', month: startOfMonth(new Date()) });
    } else {
      setView({ kind: 'day', dateKey: toKey(new Date()) });
    }
  };

  return (
    <View style={styles.root}>
      {view.kind === 'list' && (
        <MonthCalendar
          ref={calRef}
          habits={habits}
          logs={logs}
          firstUse={firstUseDate}
          onDayPress={(dateKey) => setView({ kind: 'day', dateKey })}
          onMonthTitlePress={(month) => setView({ kind: 'month', month })}
          ListHeaderComponent={
            <View>
              <HeroCard
                habits={habits}
                logs={logs}
                onPress={() => setHistoryVisible(true)}
              />
              <HabitForm onSave={addHabit} />
            </View>
          }
        />
      )}

      {view.kind === 'month' && (
        <MonthView
          month={view.month}
          minMonth={startOfMonth(firstUseDate)}
          habits={habits}
          logs={logs}
          onMonthChange={(m) => setView({ kind: 'month', month: m })}
          onBack={() => setView({ kind: 'list' })}
          onDayPress={(dateKey) => setView({ kind: 'day', dateKey })}
        />
      )}

      {view.kind === 'day' && (
        <DayView
          dateKey={view.dateKey}
          minDateKey={minDateKey}
          habits={habits}
          logs={logs}
          onDateChange={(dateKey) => setView({ kind: 'day', dateKey })}
          onBack={() =>
            setView({ kind: 'month', month: startOfMonth(fromKey(view.dateKey)) })
          }
          saveDayLog={saveDayLog}
          onOpenAnalysis={(sundayKey) =>
            setAnalysisReq({ mode: 'weekly', sundayKey })
          }
        />
      )}

      {/* Dock flotante */}
      <View style={styles.dock}>
        <Pressable style={styles.dockBtn} onPress={onToday}>
          <Text style={styles.dockText}>{t('today')}</Text>
        </Pressable>
        <View style={styles.dockDivider} />
        <Pressable style={styles.dockBtn} onPress={() => setLegendVisible(true)}>
          <Text style={styles.dockText}>{t('habits')}</Text>
        </Pressable>
      </View>

      <HabitsLegendModal
        visible={legendVisible}
        habits={habits}
        logs={logs}
        firstUse={startOfMonth(firstUseDate)}
        onClose={() => setLegendVisible(false)}
        onDelete={removeHabit}
        onUpdate={(id, data) => updateHabit(id, data)}
      />
      <DailyLogHistorySheet
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
      />
      <AnalysisSheet request={analysisReq} onClose={() => setAnalysisReq(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  dock: {
    position: 'absolute',
    bottom: 18,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20,10,40,0.85)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  dockBtn: { paddingHorizontal: 22, paddingVertical: 10 },
  dockText: { color: theme.colors.cyan, fontSize: 16, fontWeight: '800' },
  dockDivider: {
    width: 1,
    height: 22,
    backgroundColor: theme.colors.border,
  },
});
