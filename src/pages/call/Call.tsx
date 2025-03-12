import {
  StreamCall,
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
import { useLoggedInAuth } from "../../context/AuthContext";
import UILayout from "./UiLayout";

export default function Call() {
  const { user, streamToken } = useLoggedInAuth();
  const apiKey = import.meta.env.VITE_STREAM_API_KEY!;

  const client = new StreamVideoClient({ apiKey, user, token: streamToken });
  const call = client.call("default", crypto.randomUUID());
  call.join({ create: true });

  if (streamToken == null || user == null) return <div>Loading...</div>;

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <UILayout />
      </StreamCall>
    </StreamVideo>
  );
}
