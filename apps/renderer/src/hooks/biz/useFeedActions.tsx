import { WEB_URL } from "@follow/shared/constants"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { whoami } from "~/atoms/user"
import { useModalStack } from "~/components/ui/modal"
import type { NativeMenuItem } from "~/lib/native-menu"
import { useFeedClaimModal } from "~/modules/claim"
import { FeedForm } from "~/modules/discover/feed-form"
import { Queries } from "~/queries"
import { getFeedById, useAddFeedToFeedList, useFeedById } from "~/store/feed"
import { subscriptionActions, useSubscriptionByFeedId } from "~/store/subscription"

import { useAuthQuery } from "../common"
import { useNavigateEntry } from "./useNavigateEntry"
import { getRouteParams } from "./useRouteParams"
import { useDeleteSubscription } from "./useSubscriptionActions"

export const useFeedActions = ({
  feedId,
  view,
  type,
}: {
  feedId: string
  view?: number
  type?: "feedList" | "entryList"
}) => {
  const { t } = useTranslation()
  const feed = useFeedById(feedId)
  const subscription = useSubscriptionByFeedId(feedId)

  const { present } = useModalStack()
  const deleteSubscription = useDeleteSubscription({})
  const claimFeed = useFeedClaimModal({
    feedId,
  })

  const navigateEntry = useNavigateEntry()
  const isEntryList = type === "entryList"

  const listList = useAuthQuery(Queries.lists.list())
  const addMutation = useAddFeedToFeedList()

  const items = useMemo(() => {
    if (!feed) return []
    const isList = feed?.type === "list"
    const items: NativeMenuItem[] = [
      ...(!isList
        ? [
            {
              type: "text" as const,
              label: t("sidebar.feed_actions.mark_all_as_read"),
              shortcut: "Meta+Shift+A",
              disabled: isEntryList,
              click: () => subscriptionActions.markReadByFeedIds({ feedIds: [feedId] }),
            },
          ]
        : []),
      ...(!feed.ownerUserId && !!feed.id && !isList
        ? [
            {
              type: "text" as const,
              label: isEntryList
                ? t("sidebar.feed_actions.claim_feed")
                : t("sidebar.feed_actions.claim"),
              shortcut: "C",
              click: () => {
                claimFeed()
              },
            },
          ]
        : []),
      ...(feed.ownerUserId === whoami()?.id
        ? [
            {
              type: "text" as const,
              label: t(
                isList
                  ? "sidebar.feed_actions.list_owned_by_you"
                  : "sidebar.feed_actions.feed_owned_by_you",
              ),
            },
          ]
        : []),
      {
        type: "separator" as const,
        disabled: isEntryList,
      },
      ...(!isList
        ? [
            {
              type: "text" as const,
              label: t("sidebar.feed_column.context_menu.add_feeds_to_list"),
              enabled: !!listList.data?.length,
              submenu: listList.data?.map((list) => ({
                label: list.title || "",
                type: "text" as const,
                click() {
                  return addMutation.mutate({
                    feedId,
                    listId: list.id,
                  })
                },
              })),
            },
            {
              type: "separator" as const,
              disabled: isEntryList,
            },
          ]
        : []),
      {
        type: "text" as const,
        label: isEntryList ? t("sidebar.feed_actions.edit_feed") : t("sidebar.feed_actions.edit"),
        shortcut: "E",
        click: () => {
          present({
            title: isList
              ? t("sidebar.feed_actions.edit_list")
              : t("sidebar.feed_actions.edit_feed"),
            content: ({ dismiss }) => (
              <FeedForm asWidget id={feedId} onSuccess={dismiss} isList={isList} />
            ),
          })
        },
      },
      {
        type: "text" as const,
        label: isEntryList
          ? t("sidebar.feed_actions.unfollow_feed")
          : t("sidebar.feed_actions.unfollow"),
        shortcut: "Meta+Backspace",
        click: () => deleteSubscription.mutate(subscription),
      },
      {
        type: "text" as const,
        label: t(
          isList
            ? "sidebar.feed_actions.navigate_to_list"
            : "sidebar.feed_actions.navigate_to_feed",
        ),
        shortcut: "Meta+G",
        disabled: !isEntryList || getRouteParams().feedId === feedId,
        click: () => {
          navigateEntry({ feedId })
        },
      },
      {
        type: "separator" as const,
        disabled: isEntryList,
      },
      {
        type: "text" as const,
        label: t(
          isList
            ? "sidebar.feed_actions.open_list_in_browser"
            : "sidebar.feed_actions.open_feed_in_browser",
          { which: t(window.electron ? "words.browser" : "words.newTab") },
        ),
        disabled: isEntryList,
        shortcut: "O",
        click: () =>
          window.open(
            isList
              ? `${WEB_URL}/list/${feedId}?view=${view}`
              : `${WEB_URL}/feed/${feedId}?view=${view}`,
            "_blank",
          ),
      },
      ...(!isList
        ? [
            {
              type: "text" as const,
              label: t("sidebar.feed_actions.open_site_in_browser", {
                which: t(window.electron ? "words.browser" : "words.newTab"),
              }),
              shortcut: "Meta+O",
              disabled: isEntryList,
              click: () => {
                const feed = getFeedById(feedId)
                if (feed) {
                  "siteUrl" in feed && feed.siteUrl && window.open(feed.siteUrl, "_blank")
                }
              },
            },
          ]
        : []),
      {
        type: "separator",
        disabled: isEntryList,
      },
      {
        type: "text" as const,
        label: t(
          isList ? "sidebar.feed_actions.copy_list_url" : "sidebar.feed_actions.copy_feed_url",
        ),
        disabled: isEntryList,
        shortcut: "Meta+C",
        click: () => {
          const url = isList ? `${WEB_URL}/list/${feedId}?view=${view}` : feed.url
          navigator.clipboard.writeText(url)
        },
      },
      {
        type: "text" as const,
        label: t(
          isList ? "sidebar.feed_actions.copy_list_id" : "sidebar.feed_actions.copy_feed_id",
        ),
        shortcut: "Meta+Shift+C",
        disabled: isEntryList,
        click: () => {
          navigator.clipboard.writeText(feedId)
        },
      },
    ]

    return items
  }, [
    t,
    claimFeed,
    deleteSubscription,
    feed,
    feedId,
    isEntryList,
    navigateEntry,
    present,
    subscription,
    view,
  ])

  return { items }
}
