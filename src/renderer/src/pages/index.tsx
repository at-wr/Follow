import { FeedColumn } from "@renderer/components/feed-column"
import { EntryColumn } from "@renderer/components/entry-column"
import { useEffect, useState } from "react"
import { ActivedList, ActivedEntry } from "@renderer/lib/types"
import { cn } from "@renderer/lib/utils"
import { EntryContent } from "@renderer/components/entry-content"
import { AnimatePresence } from "framer-motion"

const wideMode = [1, 2, 3, 4]

export function Component() {
  const [activedList, setActivedList] = useState<ActivedList>({
    level: "view",
    id: 0,
    name: "Articles",
    view: 0,
  })
  const [activedEntry, setActivedEntry] = useState<ActivedEntry>(null)

  useEffect(() => {
    setActivedEntry(null)
  }, [activedList])

  return (
    <div className="flex h-full">
      <div className="w-64 pt-10 border-r shrink-0 bg-[#E1E0DF]">
        <FeedColumn activedList={activedList} setActivedList={setActivedList} />
      </div>
      <div
        className={cn(
          "pt-10 border-r shrink-0 h-full overflow-y-auto",
          activedList && wideMode.includes(activedList.view)
            ? "flex-1"
            : "w-[340px]",
        )}
      >
        <EntryColumn
          activedList={activedList}
          activedEntry={activedEntry}
          setActivedEntry={setActivedEntry}
        />
      </div>
      <AnimatePresence>
        {!(activedList && wideMode.includes(activedList.view)) &&
          activedEntry && (
            <div className="flex-1 pt-10">
              <EntryContent entry={activedEntry} />
            </div>
          )}
      </AnimatePresence>
    </div>
  )
}
