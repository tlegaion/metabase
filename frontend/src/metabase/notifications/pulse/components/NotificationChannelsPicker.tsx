import { assoc, updateIn } from "icepick";
import { t } from "ttag";

import { useListChannelsQuery } from "metabase/api/channel";
import { createChannel } from "metabase/lib/pulse";
import { Accordion } from "metabase/ui";
import type {
  Alert,
  Channel,
  ChannelApiResponse,
  ChannelType,
  NotificationChannel,
  User,
} from "metabase-types/api";

import { EmailChannelEdit } from "./EmailChannelEdit";
import { SlackChannelEdit } from "./SlackChannelEdit";
import { WebhookChannelEdit } from "./WebhookChannelEdit";

const DEFAULT_CHANNELS_CONFIG = {
  email: { name: t`Email`, type: "email" },
  slack: { name: t`Slack`, type: "slack" },
  http: { name: t`Http`, type: "http" },
};

interface NotificationChannelsPickerProps {
  pulse: Alert;
  channels: ChannelApiResponse["channels"] | undefined;
  user: User;
  users: User[];
  setPulse: (value: Alert) => void;
  emailRecipientText: string;
  invalidRecipientText: (domains: string) => string;
}

export const NotificationChannelsPicker = ({
  pulse,
  channels: nullableChannels,
  user,
  users,
  setPulse,
  invalidRecipientText,
}: NotificationChannelsPickerProps) => {
  const { data: notificationChannels = [] } = useListChannelsQuery();

  const addChannel = (
    type: ChannelType,
    notification?: NotificationChannel,
  ) => {
    const channelSpec = channels[type];
    if (!channelSpec) {
      return;
    }

    const channel = createChannel(
      channelSpec,
      notification ? { channel_id: notification.id } : undefined,
    );

    setPulse({ ...pulse, channels: pulse.channels.concat(channel) });
  };

  const onChannelPropertyChange = (index: number, name: string, value: any) => {
    const channels = [...pulse.channels];

    channels[index] = { ...channels[index], [name]: value };

    setPulse({ ...pulse, channels });
  };

  const toggleChannel = (
    type: ChannelType,
    index: number,
    enable: boolean,
    notification?: NotificationChannel,
  ) => {
    if (enable) {
      if (pulse.channels[index]) {
        setPulse(
          updateIn(pulse, ["channels", index], (channel: Channel) =>
            assoc(channel, "enabled", true),
          ),
        );
      } else {
        addChannel(type, notification);
      }
    } else {
      const channel = pulse.channels[index];

      const shouldRemoveChannel =
        type === "email" && channel?.recipients?.length === 0;

      const updatedPulse = shouldRemoveChannel
        ? updateIn(pulse, ["channels"], channels =>
            channels.toSpliced(index, 1),
          )
        : updateIn(pulse, ["channels", index], (channel: Channel) =>
            assoc(channel, "enabled", false),
          );
      setPulse(updatedPulse);
    }
  };

  // Default to show the default channels until full formInput is loaded
  const channels = (nullableChannels ||
    DEFAULT_CHANNELS_CONFIG) as ChannelApiResponse["channels"];

  return (
    <Accordion defaultValue={["email", "slack"]} variant="separated" multiple>
      <Accordion.Item value="email">
        <Accordion.Control>{t`Email`}</Accordion.Control>
        <Accordion.Panel>
          <EmailChannelEdit
            user={user}
            users={users}
            toggleChannel={toggleChannel}
            onChannelPropertyChange={onChannelPropertyChange}
            channelSpec={channels.email}
            alert={pulse}
            invalidRecipientText={invalidRecipientText}
          />
        </Accordion.Panel>
      </Accordion.Item>

      {channels.slack.configured && (
        <Accordion.Item value="slack">
          <Accordion.Control>{t`Slack`}</Accordion.Control>
          <Accordion.Panel>
            <SlackChannelEdit
              user={user}
              toggleChannel={toggleChannel}
              onChannelPropertyChange={onChannelPropertyChange}
              channelSpec={channels.slack}
              alert={pulse}
            />
          </Accordion.Panel>
        </Accordion.Item>
      )}

      {notificationChannels.map(notification => (
        <Accordion.Item
          key={`webhook-${notification.id}`}
          value={`webhook-${notification.id}`}
        >
          <Accordion.Control>{notification.name}</Accordion.Control>
          <Accordion.Panel>
            <WebhookChannelEdit
              toggleChannel={toggleChannel}
              channelSpec={channels.http}
              alert={pulse}
              notification={notification}
            />
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
};
