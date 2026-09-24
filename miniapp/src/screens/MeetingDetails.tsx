import { useState, type ReactNode } from "react";
import { MapPin, Calendar, Clock, User, Share2, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { sportById } from "@/data/mock";
import { useStore } from "@/store";
import { useNav } from "@/nav";
import { max } from "@/lib/max";
import { formatDate, isPast } from "@/lib/format";
import { ScreenLayout, EmptyState } from "@/components/Layout";
import { CapacityBar } from "@/components/MeetingCard";
import { Button, Card } from "@/components/ui";

export function MeetingDetailsScreen({ id }: { id: string }) {
  const { getMeeting, isJoined, participants, join, leave, remove } = useStore();
  const { back } = useNav();
  const [confirmLeave, setConfirmLeave] = useState(false);
  const meeting = getMeeting(id);

  if (!meeting) {
    return (
      <ScreenLayout title="Встреча">
        <EmptyState emoji="🤷" title="Встреча не найдена" text="Возможно, её отменили." />
      </ScreenLayout>
    );
  }

  const sport = sportById(meeting.sport);
  const joined = isJoined(meeting.id);
  const taken = participants(meeting);
  const full = taken >= meeting.capacity;
  const past = isPast(meeting.date, meeting.time);

  const handleJoin = () => {
    join(meeting.id);
    max.haptic.notify("success");
  };

  const handleLeave = () => {
    if (!confirmLeave) {
      setConfirmLeave(true);
      max.haptic.notify("warning");
      return;
    }
    if (meeting.mine) {
      remove(meeting.id);
      back();
    } else {
      leave(meeting.id);
    }
    setConfirmLeave(false);
  };

  const share = () =>
    max.share(
      `${sport.emoji} ${meeting.title}\n📍 ${meeting.place}, ${meeting.city}\n🗓 ${formatDate(meeting.date)}, ${meeting.time}\n\nПрисоединяйся в SportBuddy!`,
    );

  let footer = null;
  if (!past) {
    if (confirmLeave) {
      footer = (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => setConfirmLeave(false)}>
            Нет
          </Button>
          <Button variant="danger" onClick={handleLeave} className="!bg-error-500 !text-white">
            {meeting.mine ? "Да, отменить" : "Да, выйти"}
          </Button>
        </div>
      );
    } else if (joined) {
      footer = (
        <Button variant="danger" onClick={handleLeave}>
          {meeting.mine ? <Trash2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {meeting.mine ? "Отменить встречу" : "Отменить запись"}
        </Button>
      );
    } else {
      footer = (
        <Button onClick={handleJoin} disabled={full}>
          {full ? "Мест нет" : "Присоединиться"}
        </Button>
      );
    }
  }

  return (
    <ScreenLayout title={meeting.title} subtitle={sport.label} footer={footer}>
      <div className="space-y-3 animate-fade-in">
        <div
          className={`rounded-2xl p-4 text-white flex items-center gap-3 bg-gradient-to-r ${
            joined ? "from-success-500 to-emerald-500" : "from-max-500 to-max-600"
          }`}
        >
          <span className="text-4xl">{sport.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{meeting.title}</p>
            <p className="text-white/80 text-xs">{sport.label}</p>
          </div>
          {joined && (
            <span className="flex items-center gap-1 px-2 py-1 bg-white/20 text-[10px] font-bold rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              {meeting.mine ? "ОРГАНИЗАТОР" : past ? "БЫЛ" : "ЗАПИСАН"}
            </span>
          )}
        </div>

        <Card className="p-4 space-y-3">
          <Row icon={<MapPin className="w-4 h-4" />}>
            {meeting.place}, {meeting.city}
          </Row>
          <Row icon={<Calendar className="w-4 h-4" />}>
            {formatDate(meeting.date)}
            <Clock className="w-4 h-4 text-slate-400 ml-3 mr-1.5 inline" />
            {meeting.time}
          </Row>
          <Row icon={<User className="w-4 h-4" />}>
            Организатор: <span className="font-medium text-slate-700">{meeting.mine ? "ты" : meeting.organizer}</span>
          </Row>
          {past ? (
            <p className="text-sm text-slate-400">Встреча уже прошла · участвовало {taken}</p>
          ) : (
            <CapacityBar taken={taken} capacity={meeting.capacity} />
          )}
        </Card>

        {meeting.comment && (
          <Card className="p-4">
            <p className="text-xs font-semibold text-slate-400 mb-1">Комментарий организатора</p>
            <p className="text-sm text-slate-600 whitespace-pre-line">{meeting.comment}</p>
          </Card>
        )}

        <button
          onClick={share}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-max-50 text-max-600 text-sm font-semibold active:scale-[0.97] transition"
        >
          <Share2 className="w-4 h-4" /> Позвать друзей
        </button>
      </div>
    </ScreenLayout>
  );
}

function Row({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 text-sm text-slate-600">
      <span className="text-slate-400 mt-0.5 flex-shrink-0">{icon}</span>
      <span>{children}</span>
    </div>
  );
}
