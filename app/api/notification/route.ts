import { NextRequest } from "next/server";
import { Expo, ExpoPushMessage } from "expo-server-sdk";

let expo = new Expo({
  useFcmV1: true, // this can be set to true in order to use the FCM v1 API
});

const POST = async (req: NextRequest) => {
  const { pushTokens, title, body, data } = await req.json();

  let messages: ExpoPushMessage[] = [];
  for (let pushToken of pushTokens) {
    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
    messages.push({
      to: pushToken,
      title: title,
      body: body,
      data: data || undefined,
    });
  }

  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];

  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log(ticketChunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error(error);
    }
  }
  console.log(chunks);
  let receiptIds = [];
  for (let ticket of tickets) {
    // @ts-ignore
    if (ticket?.id) {
      // @ts-ignore
      receiptIds.push(ticket?.id);
    }
  }

  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

  let receiptsMap = {};
  for (let chunk of receiptIdChunks) {
    try {
      let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
      receiptsMap = {
        ...receiptsMap,
        ...receipts,
      };
    } catch (error) {
      console.error(error);
    }
  }

  return new Response(JSON.stringify(receiptsMap), { status: 200 });
};

export { POST };
