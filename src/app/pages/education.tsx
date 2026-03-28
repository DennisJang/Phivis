import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronLeft,
  Calendar,
  BookOpen,
  Award,
  Target,
  ChevronRight,
  Bell,
  BellOff,
  Loader2,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/useAuthStore'
import { useDashboardStore } from '../../stores/useDashboardStore'
import type { KiipSchedule, KiipAlert } from '../../types'

// ============================================
// Education Page — Phase 4 DB 바인딩
// 섹션 3개:
//   1. KIIP Schedule → kiip_schedules 테이블
//   2. Practice Tests → 정적 데이터 (DB 미존재)
//   3. E-7-4 Points → visa_trackers (useDashboardStore 경유)
// ============================================

export function Education() {
  // --- Auth ---
  const user = useAuthStore((s) => s.user)

  // --- Dashboard store (이미 hydrate됨) → E-7-4 점수 ---
  const visaTracker = useDashboardStore((s) => s.visaTracker)

  // --- KIIP local state ---
  const [schedules, setSchedules] = useState<KiipSchedule[]>([])
  const [alert, setAlert] = useState<KiipAlert | null>(null)
  const [loadingSchedules, setLoadingSchedules] = useState(true)
  const [togglingAlert, setTogglingAlert] = useState(false)

  // ============================================
  // KIIP 일정 조회 — kiip_schedules (공개, RLS 필요 없음)
  // 활성 일정만, 시작일 오름차순
  // ============================================
  const fetchSchedules = useCallback(async () => {
    setLoadingSchedules(true)
    try {
      const { data, error } = await supabase
        .from('kiip_schedules')
        .select('*')
        .eq('is_active', true)
        .order('start_date', { ascending: true })

      if (error) {
        console.error('[Education] kiip_schedules error:', error?.message)
      }
      setSchedules(data ?? [])
    } catch (err) {
      console.error('[Education] fetchSchedules:', err)
    } finally {
      setLoadingSchedules(false)
    }
  }, [])

  // ============================================
  // KIIP 알림 구독 조회 — kiip_alerts (유저별, RLS)
  // ============================================
  const fetchAlert = useCallback(async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('kiip_alerts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('[Education] kiip_alerts error:', error?.message)
      }
      setAlert(data ?? null)
    } catch (err) {
      console.error('[Education] fetchAlert:', err)
    }
  }, [user])

  useEffect(() => {
    fetchSchedules()
    fetchAlert()
  }, [fetchSchedules, fetchAlert])

  // ============================================
  // 알림 토글 — insert or update
  // 규칙 #15: upsert Partial Index 불가 → select 후 insert/update
  // ============================================
  const toggleAlert = async () => {
    if (!user || togglingAlert) return
    setTogglingAlert(true)

    try {
      const targetStage = visaTracker?.kiip_stage ?? 0

      if (alert) {
        // UPDATE: 토글
        const { error } = await supabase
          .from('kiip_alerts')
          .update({ alert_enabled: !alert.alert_enabled })
          .eq('id', alert.id)

        if (error) throw error
        setAlert({ ...alert, alert_enabled: !alert.alert_enabled })
      } else {
        // INSERT: 첫 구독
        const { data, error } = await supabase
          .from('kiip_alerts')
          .insert({
            user_id: user.id,
            target_stage: targetStage,
            alert_enabled: true,
          })
          .select()
          .single()

        if (error) throw error
        setAlert(data)
      }
    } catch (err) {
      console.error('[Education] toggleAlert:', err)
    } finally {
      setTogglingAlert(false)
    }
  }

  // ============================================
  // Practice Tests — 정적 (DB 테이블 미존재)
  // 추후 확장 시 별도 테이블 추가
  // ============================================
  const mockExams = [
    {
      id: 1,
      title: 'Level 2 Practice Test',
      titleKr: '2단계 모의고사',
      questions: 50,
      duration: '60 min',
      lastScore: 82,
      attempts: 3,
    },
    {
      id: 2,
      title: 'Level 3 Preview Test',
      titleKr: '3단계 사전평가',
      questions: 40,
      duration: '50 min',
      lastScore: null,
      attempts: 0,
    },
  ]

  // ============================================
  // E-7-4 점수 — visa_trackers에서 매핑
  // 규칙: 비자 점수는 결정론적 코드로만 (AI 추론 금지)
  // ============================================
  const e74Criteria = [
    {
      category: 'Age',
      categoryKr: '연령',
      points: visaTracker?.age_score ?? 0,
      max: 20,
      description: 'Max 20 points',
    },
    {
      category: 'Salary',
      categoryKr: '급여',
      points: visaTracker?.income_score ?? 0,
      max: 25,
      description: 'Based on annual income',
    },
    {
      category: 'Korean',
      categoryKr: '한국어',
      points: visaTracker?.korean_score ?? 0,
      max: 20,
      description: `KIIP Stage ${visaTracker?.kiip_stage ?? 0}`,
    },
    {
      category: 'Social',
      categoryKr: '사회통합',
      points: visaTracker?.social_score ?? 0,
      max: 15,
      description: 'Social integration',
    },
    {
      category: 'Volunteer',
      categoryKr: '봉사활동',
      points: visaTracker?.volunteer_score ?? 0,
      max: 20,
      description: 'Community service',
    },
  ]

  const totalPoints = e74Criteria.reduce((sum, item) => sum + item.points, 0)
  const maxPoints = e74Criteria.reduce((sum, item) => sum + item.max, 0)

  // ============================================
  // 헬퍼: KIIP 일정 → UI 상태 매핑
  // ============================================
  const getScheduleStatus = (schedule: KiipSchedule) => {
    const today = new Date().toISOString().split('T')[0]
    if (schedule.end_date < today) return 'completed'
    if (schedule.start_date <= today && schedule.end_date >= today)
      return 'ongoing'
    return 'upcoming'
  }

  const formatScheduleDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    const month = d.toLocaleString('en', { month: 'short' })
    const day = d.getDate()
    const weekday = d.toLocaleString('en', { weekday: 'short' })
    return { month, day, weekday }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-black/5 sticky top-0 z-10 backdrop-blur-xl">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/home"
              className="w-10 h-10 -ml-2 flex items-center justify-center active:scale-95 transition-transform"
            >
              <ChevronLeft
                size={24}
                className="text-[#007AFF]"
                strokeWidth={2.5}
              />
            </Link>
            <h1 className="text-xl flex-1" style={{ fontWeight: 600 }}>
              Education
            </h1>

            {/* KIIP 알림 토글 버튼 */}
            {user && (
              <button
                onClick={toggleAlert}
                disabled={togglingAlert}
                className="w-10 h-10 flex items-center justify-center rounded-xl active:scale-95 transition-transform"
                aria-label={
                  alert?.alert_enabled
                    ? 'Disable KIIP alerts'
                    : 'Enable KIIP alerts'
                }
              >
                {togglingAlert ? (
                  <Loader2
                    size={20}
                    className="text-[#86868B] animate-spin"
                  />
                ) : alert?.alert_enabled ? (
                  <Bell size={20} className="text-[#007AFF]" />
                ) : (
                  <BellOff size={20} className="text-[#86868B]" />
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="px-6 py-8 space-y-8">
        {/* ============================================
            KIIP Schedule — DB 바인딩
            ============================================ */}
        <div>
          <h2 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            KIIP Schedule
          </h2>

          {loadingSchedules ? (
            <div className="bg-white rounded-3xl p-8 flex items-center justify-center">
              <Loader2
                size={24}
                className="text-[#007AFF] animate-spin"
              />
            </div>
          ) : schedules.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center">
              <Calendar
                size={32}
                className="text-[#86868B] mx-auto mb-3"
              />
              <p
                className="text-sm text-[#86868B]"
              >
                No upcoming KIIP classes
              </p>
              <p className="text-xs text-[#86868B] mt-1">
                현재 등록된 수업이 없습니다
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl divide-y divide-black/5">
              {schedules.map((schedule) => {
                const status = getScheduleStatus(schedule)
                const { day, weekday } = formatScheduleDate(
                  schedule.start_date
                )
                return (
                  <button
                    key={schedule.id}
                    className="w-full flex items-start gap-4 p-5 text-left active:bg-[#F5F5F7] transition-colors"
                  >
                    <div
                      className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 ${
                        status === 'upcoming' || status === 'ongoing'
                          ? 'bg-[#007AFF]/10'
                          : 'bg-[#F5F5F7]'
                      }`}
                    >
                      <span
                        className="text-base"
                        style={{
                          fontWeight: 600,
                          color:
                            status === 'upcoming' || status === 'ongoing'
                              ? '#007AFF'
                              : '#86868B',
                        }}
                      >
                        {day}
                      </span>
                      <span
                        className="text-xs"
                        style={{
                          color:
                            status === 'upcoming' || status === 'ongoing'
                              ? '#007AFF'
                              : '#86868B',
                        }}
                      >
                        {weekday}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar size={14} className="text-[#86868B]" />
                        <span className="text-xs text-[#86868B]">
                          {schedule.start_date} ~ {schedule.end_date}
                        </span>
                      </div>
                      <h3
                        className="text-sm mb-0.5"
                        style={{ fontWeight: 600 }}
                      >
                        Stage {schedule.stage} 과정
                      </h3>
                      <p className="text-xs text-[#86868B] mb-2">
                        {schedule.registration_deadline &&
                          `등록마감: ${schedule.registration_deadline}`}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-[#F5F5F7] text-[#86868B] px-2 py-0.5 rounded-full">
                          📍 {schedule.location}
                        </span>
                        {schedule.capacity > 0 && (
                          <span className="text-xs bg-[#F5F5F7] text-[#86868B] px-2 py-0.5 rounded-full">
                            정원 {schedule.capacity}명
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight
                      size={20}
                      className="text-[#86868B] flex-shrink-0 mt-2"
                    />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* ============================================
            Practice Tests — 정적 데이터 유지
            ============================================ */}
        <div>
          <h2 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Practice Tests
          </h2>
          <div className="space-y-3">
            {mockExams.map((exam) => (
              <button
                key={exam.id}
                className="w-full bg-white rounded-3xl p-5 text-left active:scale-98 transition-transform"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3
                      className="text-base mb-1"
                      style={{ fontWeight: 600 }}
                    >
                      {exam.title}
                    </h3>
                    <p className="text-xs text-[#86868B]">{exam.titleKr}</p>
                  </div>
                  {exam.lastScore && (
                    <div className="text-right">
                      <p
                        className="text-2xl"
                        style={{ fontWeight: 600, color: '#34C759' }}
                      >
                        {exam.lastScore}
                      </p>
                      <p className="text-xs text-[#86868B]">Last score</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-[#86868B]">Questions</p>
                    <p
                      className="text-sm mt-0.5"
                      style={{ fontWeight: 600 }}
                    >
                      {exam.questions}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#86868B]">Duration</p>
                    <p
                      className="text-sm mt-0.5"
                      style={{ fontWeight: 600 }}
                    >
                      {exam.duration}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#86868B]">Attempts</p>
                    <p
                      className="text-sm mt-0.5"
                      style={{ fontWeight: 600 }}
                    >
                      {exam.attempts}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-black/5">
                  <div className="flex items-center justify-center gap-2 text-[#007AFF]">
                    <BookOpen size={16} />
                    <span
                      className="text-sm"
                      style={{ fontWeight: 600 }}
                    >
                      {exam.attempts > 0 ? 'Take again' : 'Start test'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ============================================
            E-7-4 Points Guide — visa_trackers 바인딩
            ============================================ */}
        <div>
          <h2 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            E-7-4 Points Guide
          </h2>
          <div className="bg-white rounded-3xl p-6 space-y-6">
            {/* Total Score */}
            <div className="text-center pb-6 border-b border-black/5">
              <div className="inline-flex items-baseline gap-2">
                <span
                  className="text-5xl"
                  style={{ fontWeight: 600 }}
                >
                  {totalPoints}
                </span>
                <span className="text-xl text-[#86868B]">
                  / {maxPoints}
                </span>
              </div>
              <p className="text-sm text-[#86868B] mt-2">
                Current eligibility points
              </p>
              {!visaTracker && (
                <p className="text-xs text-[#86868B] mt-1">
                  비자 정보를 등록하면 실제 점수가 표시됩니다
                </p>
              )}
              <div className="mt-4 w-full bg-[#F5F5F7] rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#007AFF] to-[#34C759] rounded-full transition-all"
                  style={{
                    width: `${maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Criteria Breakdown */}
            <div className="space-y-4">
              {e74Criteria.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p
                        className="text-sm"
                        style={{ fontWeight: 600 }}
                      >
                        {item.category}
                      </p>
                      <p className="text-xs text-[#86868B]">
                        {item.categoryKr}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className="text-base"
                        style={{ fontWeight: 600 }}
                      >
                        {item.points}
                      </span>
                      <span className="text-sm text-[#86868B]">
                        {' '}
                        / {item.max}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-[#F5F5F7] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-[#007AFF] rounded-full"
                      style={{
                        width: `${item.max > 0 ? (item.points / item.max) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-[#86868B]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Improvement Tips */}
        <button className="w-full bg-gradient-to-br from-[#34C759] to-[#30A14E] rounded-3xl p-6 text-white shadow-lg active:scale-98 transition-transform">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
              <Target size={28} strokeWidth={2} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg" style={{ fontWeight: 600 }}>
                Improve your score
              </h3>
              <p className="text-sm opacity-90 mt-1">
                점수 향상 가이드 • Personalized tips to reach 80 points
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full"
                  style={{ fontWeight: 600 }}
                >
                  {maxPoints - totalPoints > 0
                    ? `+${maxPoints - totalPoints} points possible`
                    : 'Maximum reached!'}
                </span>
              </div>
            </div>
            <ChevronRight size={24} className="flex-shrink-0" />
          </div>
        </button>
      </div>
    </div>
  )
}