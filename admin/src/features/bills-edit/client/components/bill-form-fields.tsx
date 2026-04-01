"use client";

import type { Control } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  type BillStatus,
  type MeetingBody,
} from "@/features/bills/shared/types";
import type { DietSession } from "@/features/diet-sessions/shared/types";
import type { BillCreateInput } from "../../shared/types";
import { ThumbnailUpload } from "./thumbnail-upload";

const BILL_STATUS_OPTIONS: Array<{ value: BillStatus; label: string }> = [
  { value: "preparing", label: "準備中" },
  { value: "introduced", label: "議案提出済み" },
  { value: "in_originating_house", label: "付託" },
  { value: "in_receiving_house", label: "付託（継続審査等）" },
  { value: "enacted", label: "議案可決" },
  { value: "rejected", label: "議案否決" },
  { value: "reported", label: "報告事項" },
];

const MEETING_BODY_OPTIONS: Array<{ value: MeetingBody; label: string }> = [
  { value: "定例会", label: "定例会" },
  { value: "臨時会", label: "臨時会" },
  { value: "企画総務委員会", label: "企画総務委員会" },
  { value: "区民文教委員会", label: "区民文教委員会" },
  { value: "福祉保健委員会", label: "福祉保健委員会" },
  { value: "環境建設委員会", label: "環境建設委員会" },
  { value: "築地等都市基盤対策特別委員会", label: "築地等都市基盤対策特別委員会" },
  { value: "地域活性化対策特別委員会", label: "地域活性化対策特別委員会" },
  { value: "子ども子育て・高齢者対策特別委員会", label: "子ども子育て・高齢者対策特別委員会" },
  { value: "防災等安全対策特別委員会", label: "防災等安全対策特別委員会" },
  { value: "予算特別委員会", label: "予算特別委員会" },
  { value: "決算特別委員会", label: "決算特別委員会" },
];

interface BillFormFieldsProps {
  control: Control<BillCreateInput>;
  billId?: string;
  dietSessions: DietSession[];
}

export function BillFormFields({
  control,
  billId,
  dietSessions,
}: BillFormFieldsProps) {
  return (
    <>
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>議案名 *</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>
              議案の正式名称を入力してください（最大200文字）
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ステータス *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="ステータスを選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BILL_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                現在の審議状況を選択してください
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="meeting_body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>会議体 *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="会議体を選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MEETING_BODY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                議案を提出した会議体を選択してください
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="status_note"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ステータス備考</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                value={field.value || ""}
                className="min-h-[100px]"
              />
            </FormControl>
            <FormDescription>
              審議状況の詳細や補足情報を入力してください（最大500文字）
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="published_at"
        render={({ field }) => (
          <FormItem>
            <FormLabel>公開日時 *</FormLabel>
            <FormControl>
              <Input type="datetime-local" {...field} />
            </FormControl>
            <FormDescription>
              議案が公開される日時を設定してください
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="thumbnail_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>サムネイル画像</FormLabel>
            <FormControl>
              <ThumbnailUpload
                value={field.value}
                onChange={field.onChange}
                billId={billId}
              />
            </FormControl>
            <FormDescription>
              議案のサムネイル画像を設定してください（任意）
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="share_thumbnail_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>シェア用OGP画像</FormLabel>
            <FormControl>
              <ThumbnailUpload
                value={field.value}
                onChange={field.onChange}
                billId={billId}
                storagePrefix="share"
              />
            </FormControl>
            <FormDescription>
              Twitter等のSNSでシェアされた際に表示される画像を設定してください（任意）。設定しない場合はサムネイル画像が使用されます。
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="shugiin_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>衆議院URL</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value || ""}
                placeholder="https://www.shugiin.go.jp/..."
              />
            </FormControl>
            <FormDescription>
              衆議院の議案ページURLを入力してください（「これから掲載される法案」表示時に外部リンクとして使用）
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="diet_session_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>国会会期</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value ?? undefined}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="国会会期を選択" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {dietSessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.name}（{session.start_date}〜{session.end_date}）
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              議案が提出された国会会期を選択してください
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="is_featured"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>注目の議案</FormLabel>
              <FormDescription>
                トップページなどで優先的に表示されます
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </>
  );
}
