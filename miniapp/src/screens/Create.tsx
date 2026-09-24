import { useEffect, useState } from "react";
import { MapPin, Calendar, Clock, Users, FileText, Check } from "lucide-react";
import type { SportId } from "@/types";
import { CITIES } from "@/data/mock";
import { useStore } from "@/store";
import { useNav } from "@/nav";
import { max } from "@/lib/max";
import { isPast, todayIso } from "@/lib/format";
import { ScreenLayout } from "@/components/Layout";
import { SportChips } from "@/components/SportChips";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";

export function CreateScreen() {
  const { create, city: homeCity } = useStore();
  const { replace } = useNav();

  const [sport, setSport] = useState<SportId | null>(null);
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [city, setCity] = useState(homeCity);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [capacity, setCapacity] = useState(10);
  const [comment, setComment] = useState("");

  const dirty = Boolean(sport || title || place || date || time || comment);
  const inPast = Boolean(date && time && isPast(date, time));
  const canSubmit = Boolean(sport && title.trim() && place.trim() && date && time && !inPast);

  // Ask before closing the app with a half-filled form
  useEffect(() => {
    max.closingConfirmation(dirty);
    return () => max.closingConfirmation(false);
  }, [dirty]);

  const handleSubmit = () => {
    if (!canSubmit || !sport) {
      max.haptic.notify("error");
      return;
    }
    const meeting = create({
      sport,
      title: title.trim(),
      place: place.trim(),
      city,
      date,
      time,
      capacity,
      comment: comment.trim() || undefined,
    });
    max.haptic.notify("success");
    replace({ name: "meeting", id: meeting.id });
  };

  return (
    <ScreenLayout
      title="Новая встреча"
      footer={
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          <Check className="w-4 h-4" /> Создать встречу
        </Button>
      }
    >
      <div className="space-y-4 animate-fade-in">
        <Field label="Вид спорта">
          <SportChips value={sport} onChange={setSport} wrap />
        </Field>

        <Field label="Название" icon={<FileText className="w-3.5 h-3.5" />} htmlFor="c-title">
          <Input
            id="c-title"
            value={title}
            maxLength={60}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Напр. Футбол на выходных"
          />
        </Field>

        <Field label="Место" icon={<MapPin className="w-3.5 h-3.5" />} htmlFor="c-place">
          <Input
            id="c-place"
            value={place}
            maxLength={100}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="Адрес, парк, площадка"
          />
          <Select aria-label="Город" value={city} onChange={(e) => setCity(e.target.value)} className="mt-1.5">
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Дата" icon={<Calendar className="w-3.5 h-3.5" />} htmlFor="c-date">
            <Input id="c-date" type="date" min={todayIso()} value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Время" icon={<Clock className="w-3.5 h-3.5" />} htmlFor="c-time">
            <Input id="c-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
        </div>
        {inPast && <p className="-mt-2 px-1 text-xs text-error-500">Это время уже прошло</p>}

        <Field
          label={
            <>
              Участников вместе с тобой: <span className="text-max-600 font-bold">{capacity}</span>
            </>
          }
          icon={<Users className="w-3.5 h-3.5" />}
          htmlFor="c-capacity"
        >
          <input
            id="c-capacity"
            type="range"
            min={2}
            max={30}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="w-full accent-max-500"
          />
        </Field>

        <Field label="Комментарий" icon={<FileText className="w-3.5 h-3.5" />} htmlFor="c-comment">
          <Textarea
            id="c-comment"
            value={comment}
            maxLength={300}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Что взять с собой, уровень игры…"
            rows={3}
          />
        </Field>
      </div>
    </ScreenLayout>
  );
}
