import { assertEquals, assertStrictEquals } from "@std/assert";
import { ChannelType, PermissionFlagsBits } from "discord.js";
import {
  buildPrivateChannelName,
  createPrivateTextChannel,
  deleteTextChannel,
  ensurePrivateTextChannel,
} from "./privateChannel.ts";

Deno.test("buildPrivateChannelName normalizes discord channel names", () => {
  const users = [{ username: "Jane Doe!" }, { username: "TRAIN_NOW" }];

  assertEquals(
    buildPrivateChannelName("bwt", users as never),
    "bwt-jane-doe-train-now",
  );
});

Deno.test(
  "buildPrivateChannelName falls back when a segment has no valid characters",
  () => {
    const users = [{ username: "!!!" }, { username: "   " }];

    assertEquals(
      buildPrivateChannelName("bwt", users as never),
      "bwt-user-user",
    );
  },
);

Deno.test(
  "buildPrivateChannelName limits each segment and the final channel name",
  () => {
    const users = [
      { username: "a".repeat(30) },
      { username: "b".repeat(30) },
      { username: "c".repeat(80) },
      { username: "d".repeat(80) },
      { username: "e".repeat(80) },
    ];
    const channelName = buildPrivateChannelName(
      "buddies-workout-tracker",
      users as never,
    );

    assertEquals(channelName.length, 100);
    assertEquals(
      channelName,
      [
        "buddies-workout-tracker",
        "a".repeat(24),
        "b".repeat(24),
        "c".repeat(24),
        "d",
      ].join("-"),
    );
  },
);

Deno.test(
  "createPrivateTextChannel creates a locked text channel for the bot and users",
  async () => {
    const createdPayloads: unknown[] = [];
    const guild = createGuild({
      create: (payload: unknown) => {
        createdPayloads.push(payload);
        return Promise.resolve({ id: "new-channel" });
      },
    });

    const channel = await createPrivateTextChannel(guild as never, {
      botUser: { id: "bot-id" } as never,
      name: "BWT Jane Doe!",
      topic: "Workout tracker",
      users: [{ id: "user-1" }, { id: "user-2" }] as never,
    });

    assertEquals((channel as { id: string })?.id, "new-channel");
    assertEquals(createdPayloads, [
      {
        name: "bwt-jane-doe",
        type: ChannelType.GuildText,
        topic: "Workout tracker",
        permissionOverwrites: [
          {
            id: "everyone-id",
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: "bot-id",
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.AddReactions,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.ManageMessages,
            ],
          },
          {
            id: "user-1",
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
            ],
          },
          {
            id: "user-2",
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
            ],
          },
        ],
      },
    ]);
  },
);

Deno.test(
  "createPrivateTextChannel returns undefined when Discord creation fails",
  async () => {
    const guild = createGuild({
      create: () => Promise.reject(new Error("missing permissions")),
    });

    const channel = await createPrivateTextChannel(guild as never, {
      botUser: { id: "bot-id" } as never,
      name: "bwt",
      users: [{ id: "user-1" }] as never,
    });

    assertEquals(channel, undefined);
  },
);

Deno.test(
  "ensurePrivateTextChannel reuses an existing text channel by id and repairs permissions",
  async () => {
    const edits: unknown[] = [];
    const existingChannel = createChannel({
      id: "tracker-id",
      name: "stale-name",
      edit: (id: string, permissions: unknown) => {
        edits.push({ id, permissions });
        return Promise.resolve();
      },
    });
    const guild = createGuild({
      cache: new FakeChannelCache([existingChannel]),
    });

    const result = await ensurePrivateTextChannel(guild as never, {
      botUser: { id: "bot-id" } as never,
      existingChannelId: "tracker-id",
      name: "bwt-new-name",
      users: [{ id: "user-1" }, { id: "user-2" }] as never,
    });

    assertStrictEquals(result?.channel, existingChannel);
    assertEquals(result?.created, false);
    assertEquals(edits, [
      { id: "everyone-id", permissions: { ViewChannel: false } },
      {
        id: "bot-id",
        permissions: {
          ViewChannel: true,
          SendMessages: true,
          AddReactions: true,
          ReadMessageHistory: true,
          ManageMessages: true,
        },
      },
      {
        id: "user-1",
        permissions: {
          ViewChannel: true,
          AddReactions: false,
          ReadMessageHistory: true,
          SendMessages: true,
        },
      },
      {
        id: "user-2",
        permissions: {
          ViewChannel: true,
          AddReactions: false,
          ReadMessageHistory: true,
          SendMessages: true,
        },
      },
    ]);
  },
);

Deno.test(
  "ensurePrivateTextChannel does not repurpose a matching text channel by name",
  async () => {
    const createdChannel = createChannel({
      id: "created-id",
      name: "bwt-jane",
    });
    const voiceChannel = createChannel({
      id: "wrong-type",
      name: "bwt-jane",
      type: ChannelType.GuildVoice,
    });
    const unrelatedTextChannel = createChannel({
      id: "matching-name",
      name: "bwt-jane",
    });
    const guild = createGuild({
      cache: new FakeChannelCache([voiceChannel, unrelatedTextChannel]),
      create: () => Promise.resolve(createdChannel),
    });

    const result = await ensurePrivateTextChannel(guild as never, {
      botUser: { id: "bot-id" } as never,
      existingChannelId: "wrong-type",
      name: "BWT Jane",
      users: [{ id: "user-1" }] as never,
      userPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AddReactions,
      ],
    });

    assertStrictEquals(result?.channel, createdChannel);
    assertEquals(result?.created, true);
  },
);

Deno.test(
  "ensurePrivateTextChannel creates a channel when no existing text channel matches",
  async () => {
    const createdChannel = createChannel({
      id: "created-id",
      name: "bwt-jane",
    });
    const guild = createGuild({
      cache: new FakeChannelCache([]),
      create: () => Promise.resolve(createdChannel),
    });

    const result = await ensurePrivateTextChannel(guild as never, {
      botUser: { id: "bot-id" } as never,
      name: "BWT Jane",
      users: [{ id: "user-1" }] as never,
    });

    assertStrictEquals(result?.channel, createdChannel);
    assertEquals(result?.created, true);
  },
);

Deno.test("deleteTextChannel swallows Discord delete failures", async () => {
  let deleteAttempts = 0;
  const channel = {
    delete: () => {
      deleteAttempts += 1;
      return Promise.reject(new Error("already gone"));
    },
  };

  await deleteTextChannel(channel as never);

  assertEquals(deleteAttempts, 1);
});

class FakeChannelCache {
  constructor(private readonly channels: unknown[]) {}

  get(id: string) {
    return this.channels.find(
      (channel) => (channel as { id: string }).id === id,
    );
  }

  find(predicate: (channel: never) => boolean) {
    return this.channels.find((channel) => predicate(channel as never));
  }
}

function createGuild(
  overrides: {
    cache?: FakeChannelCache;
    create?: (payload: unknown) => Promise<unknown>;
  } = {},
) {
  return {
    roles: {
      everyone: {
        id: "everyone-id",
      },
    },
    channels: {
      cache: overrides.cache ?? new FakeChannelCache([]),
      create: overrides.create ?? (() => Promise.resolve(createChannel())),
    },
  };
}

function createChannel(
  overrides: {
    id?: string;
    name?: string;
    type?: ChannelType;
    edit?: (id: string, permissions: unknown) => Promise<void>;
  } = {},
) {
  return {
    id: overrides.id ?? "channel-id",
    name: overrides.name ?? "channel-name",
    type: overrides.type ?? ChannelType.GuildText,
    permissionOverwrites: {
      edit: overrides.edit ?? (() => Promise.resolve()),
    },
  };
}
