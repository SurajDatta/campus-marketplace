/**
 * services/realtime.ts
 * Service functions used to handle realtime operations, like fetching and updating live data.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
"use client"
import { Meetup, Item, Profile, Alert, Location, TypedSupabaseClient, Message } from '@/types';
import { RealtimeChannel } from '@supabase/supabase-js';

export const subscribeToBuyItems = (
    client: TypedSupabaseClient,
    setItems: React.Dispatch<React.SetStateAction<Item[] | null>>,
    onError?: (error: any) => void
) => {

    const filterItem = (item: Item) => {
        return true
        // return item.status === "available"
    }

    var channel: RealtimeChannel;
    try {
        channel = client
            .channel("realtime buy items")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "items",
                    filter: `active=eq.true`,
                },
                (payload) => {
                    const fetchedItem = payload.new as Item;
                    if (filterItem(fetchedItem)) {
                        if (payload.eventType === "INSERT") {
                            setItems((prevItems) => prevItems ? [...prevItems, fetchedItem] : null);
                        } else if (payload.eventType === "UPDATE") {
                            setItems((prevItems) => prevItems ? prevItems.map((item) => item.id === fetchedItem.id ? fetchedItem : item) : null);
                        } else if (payload.eventType === "DELETE") {
                            setItems((prevItems) => prevItems ? prevItems.filter((item) => item.id !== fetchedItem.id) : null);
                        }
                    }
                }
            )
            .subscribe();
    } catch (error) {
        if (onError) {
            onError(error);
        }
    } finally {
        return () => {
            if (channel !== undefined) {
                client.removeChannel(channel)
            };
        };
    }
}

export const subscribeToSellItems = (
    client: TypedSupabaseClient,
    userId: string | null,
    setItems: React.Dispatch<React.SetStateAction<Item[] | null>>,
    onError?: (error: any) => void
) => {
    if (!userId) {
        return () => { };
    }

    const filterItem = (item: Item) => {
        return true
        // return item.status === "available" || item.status === "canceled"
    }

    var channel: RealtimeChannel;
    try {
        channel = client
            .channel("realtime sell items")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "items",
                    filter: `seller_id=eq.${userId}`,
                },
                (payload) => {
                    const fetchedItem = payload.new as Item;
                    if (filterItem(fetchedItem)) {
                        if (payload.eventType === "INSERT") {
                            setItems((prevItems) => prevItems ? [...prevItems, fetchedItem] : null);
                        } else if (payload.eventType === "UPDATE") {
                            setItems((prevItems) => prevItems ? prevItems.map((item) => item.id === fetchedItem.id ? fetchedItem : item) : null);
                        } else if (payload.eventType === "DELETE") {
                            setItems((prevItems) => prevItems ? prevItems.filter((item) => item.id !== fetchedItem.id) : null);
                        }
                    }
                }
            )
            .subscribe();
    } catch (error) {
        if (onError) {
            onError(error);
        }
    } finally {
        return () => {
            if (channel !== undefined) {
                client.removeChannel(channel)
            };
        };
    }
}


export const subscribeToBuyingItems = (
    client: TypedSupabaseClient,
    userId: string | null,
    setItems: React.Dispatch<React.SetStateAction<Item[] | null>>,
    onError?: (error: any) => void
) => {
    if (!userId) {
        return () => { };
    }

    const filterItem = (item: Item) => {
        return true
        // return item.status !== 'available'
    }

    var channel: RealtimeChannel;
    try {
        channel = client
            .channel("realtime pending buy items")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "items",
                    filter: `buyer_id=eq.${userId}`,
                },
                (payload) => {
                    const fetchedItem = payload.new as Item;
                    if (filterItem(fetchedItem)) {
                        if (payload.eventType === "INSERT") {
                            setItems((prevItems) => prevItems ? [...prevItems, fetchedItem] : null);
                        } else if (payload.eventType === "UPDATE") {
                            setItems((prevItems) => prevItems ? prevItems.map((item) => item.id === fetchedItem.id ? fetchedItem : item) : null);
                        } else if (payload.eventType === "DELETE") {
                            setItems((prevItems) => prevItems ? prevItems.filter((item) => item.id !== fetchedItem.id) : null);
                        }
                    }
                }
            )
            .subscribe();
    } catch (error) {
        if (onError) {
            onError(error);
        }
    } finally {
        return () => {
            if (channel !== undefined) {
                client.removeChannel(channel)
            };
        };
    }
}

export const subscribeToSellingItems = (
    client: TypedSupabaseClient,
    userId: string | null,
    setItems: React.Dispatch<React.SetStateAction<Item[] | null>>,
    onError?: (error: any) => void
) => {
    if (!userId) {
        return () => { };
    }

    const filterItem = (item: Item) => {
        return true
        // return item.status !== 'available'
    }

    var channel: RealtimeChannel;
    try {
        channel = client
            .channel("realtime pending sell items")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "items",
                    filter: `seller_id=eq.${userId}`,
                },
                (payload) => {
                    const fetchedItem = payload.new as Item;
                    if (filterItem(fetchedItem)) {
                        if (payload.eventType === "INSERT") {
                            setItems((prevItems) => prevItems ? [...prevItems, fetchedItem] : [fetchedItem]);
                        } else if (payload.eventType === "UPDATE") {
                            setItems((prevItems) => prevItems ? prevItems.map((item) => item.id === fetchedItem.id ? fetchedItem : item) : [fetchedItem]);
                        } else if (payload.eventType === "DELETE") {
                            setItems((prevItems) => prevItems ? prevItems.filter((item) => item.id !== fetchedItem.id) : [fetchedItem]);
                        }
                    }
                }
            )
            .subscribe();
    } catch (error) {
        if (onError) {
            onError(error);
        }
    } finally {
        return () => {
            if (channel !== undefined) {
                client.removeChannel(channel)
            };
        };
    }
}

export const subscribeToProfileUpdates = (
    client: TypedSupabaseClient,
    userId: string | null,
    setProfile: React.Dispatch<React.SetStateAction<Profile | null>>,
    onError?: (error: any) => void
) => {
    var channel: RealtimeChannel;
    try {
        if (!userId) {
            return () => { };
        }
        channel = client
            .channel("realtime profile")
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "profiles",
                    filter: `id=eq.${userId}`,
                },
                (payload) => {
                    const fetchedProfile = payload.new as Profile;
                    setProfile(fetchedProfile);
                }
            )
            .subscribe();
    } catch (error) {
        if (onError) {
            onError(error);
        }
    } finally {
        return () => {
            if (channel !== undefined) {
                client.removeChannel(channel)
            };
        };
    }
}

export const subscribeToMeetupUpdates = (
    client: TypedSupabaseClient,
    meetupId: string | null,
    setMeetup: React.Dispatch<React.SetStateAction<Meetup | null>>,
    onError?: (error: any) => void
) => {
    var channel: RealtimeChannel;
    try {
        if (!meetupId) {
            return () => { };
        }
        channel = client
            .channel("realtime meetup")
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "meetup",
                    filter: `id=eq.${meetupId}`,
                },
                (payload) => {
                    const fetchedMeetup = payload.new as Meetup;
                    setMeetup(fetchedMeetup);
                }
            )
            .subscribe();
    } catch (error) {
        if (onError) {
            onError(error);
        }
    } finally {
        return () => {
            if (channel !== undefined) {
                client.removeChannel(channel)
            };
        }
    }
};


export const subscribeToMessageUpdates = (
    client: TypedSupabaseClient,
    meetupId: string | null,
    setMessages: React.Dispatch<React.SetStateAction<Message[] | null>>,
    onError?: (error: any) => void
) => {
    var channel: RealtimeChannel;
    try {
        if (!meetupId) {
            return () => { };
        }
        channel = client
            .channel("realtime messages")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "messages",
                    filter: `meetup_id=eq.${meetupId}`,
                },
                (payload) => {
                    const fetchedMessage = payload.new as Message;
                    if (fetchedMessage.meetup_id === meetupId) {
                        if (payload.eventType === "INSERT") {
                            setMessages((prevMessages) => prevMessages ? [...prevMessages, fetchedMessage] : null);
                        } else if (payload.eventType === "UPDATE") {
                            setMessages((prevMessages) => prevMessages ? prevMessages.map((message) => message.id === fetchedMessage.id ? fetchedMessage : message) : null);
                        } else if (payload.eventType === "DELETE") {
                            setMessages((prevMessages) => prevMessages ? prevMessages.filter((message) => message.id !== fetchedMessage.id) : null);
                        }
                    }
                }
            )
            .subscribe();
    } catch (error) {
        if (onError) {
            onError(error);
        }
    } finally {
        return () => {
            if (channel !== undefined) {
                client.removeChannel(channel)
            };
        }
    }
}


export const subscribeToItemUpdates = (
    client: TypedSupabaseClient,
    itemId: string,
    setItem: React.Dispatch<React.SetStateAction<Item | null>>,
    onError?: (error: any) => void
) => {
    var channel: RealtimeChannel;
    try {
        channel = client
            .channel("realtime item")
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "items",
                    filter: `id=eq.${itemId}`,
                },
                (payload) => {
                    const fetchedItem = payload.new as Item;
                    setItem(fetchedItem);
                }
            )
            .subscribe();
    } catch (error) {
        if (onError) {
            onError(error);
        }
    } finally {
        return () => {
            if (channel !== undefined) {
                client.removeChannel(channel)
            };
        };
    }
};


export const subscribeToAlerts = (
    client: TypedSupabaseClient,
    alertIds: string[] | null,
    onInsert: (alert: Alert) => void,
    setAlerts: React.Dispatch<React.SetStateAction<Alert[] | null>>,
    onError?: (error: any) => void
) => {
    var channel: RealtimeChannel;
    try {
        if (!alertIds) {
            return () => { };
        }

        const filterAlert = (alert: Alert) => {
            return alertIds.includes(alert.id)
        }

        channel = client
            .channel("realtime alerts")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "alerts",
                },
                (payload) => {
                    const fetchedAlert = payload.new as Alert;
                    if (filterAlert(fetchedAlert)) {
                        if (payload.eventType === "INSERT") {
                            setAlerts((prevItems) => prevItems ? [...prevItems, fetchedAlert] : null);
                            onInsert(fetchedAlert);
                        } else if (payload.eventType === "UPDATE") {
                            setAlerts((prevItems) => prevItems ? prevItems.map((item) => item.id === fetchedAlert.id ? fetchedAlert : item) : null);
                        } else if (payload.eventType === "DELETE") {
                            setAlerts((prevItems) => prevItems ? prevItems.filter((item) => item.id !== fetchedAlert.id) : null);
                        }
                    }
                }
            )
            .subscribe();
    } catch (error) {
        if (onError) {
            onError(error);
        }
    } finally {
        return () => {
            if (channel !== undefined) {
                client.removeChannel(channel)
            };
        };
    }
}

export const subscribeToLocationUpdates = (
    client: TypedSupabaseClient,
    userId: string | null,
    setLocations: React.Dispatch<React.SetStateAction<Location[] | null>>,
    onError?: (error: any) => void
) => {
    var channel: RealtimeChannel;
    if (!userId) {
        return () => { };
    }
    try {
        channel = client
            .channel("realtime locations")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "locations",
                },
                (payload) => {
                    const fetchedLocation = payload.new as Location;
                    if (fetchedLocation.created_by === userId) {
                        if (payload.eventType === "INSERT") {
                            setLocations((prevLocations) => prevLocations ? [...prevLocations, fetchedLocation] : null);
                        } else if (payload.eventType === "UPDATE") {
                            setLocations((prevLocations) => prevLocations ? prevLocations.map((location) => location.id === fetchedLocation.id ? fetchedLocation : location) : null);
                        } else if (payload.eventType === "DELETE") {
                            setLocations((prevLocations) => prevLocations ? prevLocations.filter((location) => location.id !== fetchedLocation.id) : null);
                        }
                    }
                }
            )
            .subscribe();
    } catch (error) {
        if (onError) {
            onError(error);
        }
    } finally {
        return () => {
            if (channel !== undefined) {
                client.removeChannel(channel)
            };
        };
    }
}