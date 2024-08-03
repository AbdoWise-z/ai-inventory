"use client";

import React, {useEffect, useState} from 'react';
import {Loader2} from "lucide-react";
import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer, useTracks,
} from "@livekit/components-react";
import {Track} from "livekit-client";
import "@livekit/components-styles";

interface MediaRoomProps {
  chatId: string;
  video: boolean;
  audio: boolean;
  onLeave?: () => void;
}

const MediaRoom = (
  {
    chatId,
    video,
    audio,
    onLeave,
  } : MediaRoomProps
) => {

  const [token, setToken] = useState("");
  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(
          `/api/livekit?room=${chatId}`
        );
        const data = await resp.json();
        setToken(data.token);
      } catch (e) {
        console.error(e);
      }
    })();
  } , [chatId]);

  if (token === ""){
    return (
      <div
        className="flex flex-col flex-1 justify-center items-center"
      >
        <Loader2
          className="h-7 w-7 animate-spin text-zinc-500 my-4"
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Loading ...
        </p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      onDisconnected={onLeave}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      audio={audio}
      video={video}
      connect={true}
      data-lk-theme="default"
      style={{
        height: "100%",
      }}
    >
      <MyVideoConference />
      <RoomAudioRenderer />
      <ControlBar />
    </LiveKitRoom>
  );
};

function MyVideoConference() {
  // `useTracks` returns all camera and screen share tracks. If a user
  // joins without a published camera track, a placeholder track is returned.
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );
  return (
    <GridLayout tracks={tracks} style={{ height: 'calc(100% - var(--lk-control-bar-height))' }}>
      {/* The GridLayout accepts zero or one child. The child is used
      as a template to render all passed in tracks. */}
      <ParticipantTile />
    </GridLayout>
  );
}

export default MediaRoom;