"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  IconDashboard,
  IconArticle,
  IconCategory,
  IconTag,
  IconPhoto,
  IconUsers,
  IconShield,
  IconChartBar,
  IconSettings,
  IconMoon,
  IconSun,
  IconPencilPlus,
} from "@tabler/icons-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key?.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/studio/new"))}
          >
            <IconPencilPlus className="mr-2 h-4 w-4" />
            <span>Create new article</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/dashboard"))}
          >
            <IconDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/articles"))}
          >
            <IconArticle className="mr-2 h-4 w-4" />
            <span>Articles</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/categories"))}
          >
            <IconCategory className="mr-2 h-4 w-4" />
            <span>Categories</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/tags"))}
          >
            <IconTag className="mr-2 h-4 w-4" />
            <span>Tags</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/media"))}
          >
            <IconPhoto className="mr-2 h-4 w-4" />
            <span>Media Library</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/analytics"))}
          >
            <IconChartBar className="mr-2 h-4 w-4" />
            <span>Analytics</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/users"))}
          >
            <IconUsers className="mr-2 h-4 w-4" />
            <span>Users</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/roles"))}
          >
            <IconShield className="mr-2 h-4 w-4" />
            <span>Roles & Permissions</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/settings"))}
          >
            <IconSettings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
            <IconSun className="mr-2 h-4 w-4" />
            <span>Light mode</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
            <IconMoon className="mr-2 h-4 w-4" />
            <span>Dark mode</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
