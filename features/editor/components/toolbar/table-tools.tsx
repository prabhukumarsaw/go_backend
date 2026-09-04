"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import {
  IconTable,
  IconRowInsertBottom,
  IconRowInsertTop,
  IconColumnInsertLeft,
  IconColumnInsertRight,
  IconTrash,
} from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export function TableTools({ editor }: { editor: Editor }) {
  const isInTable = editor.isActive("table");

  return (
    <Popover>
      <PopoverTrigger
        className={`inline-flex items-center justify-center h-7 w-7 rounded-md text-sm font-medium transition-colors shrink-0 ${
          isInTable
            ? "bg-muted text-primary"
            : "hover:bg-muted hover:text-foreground text-muted-foreground"
        }`}
        title="Table Tools"
      >
        <IconTable className="h-3.5 w-3.5" />
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 space-y-1" align="start">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1">
          {isInTable ? "Table Controls" : "Insert Table"}
        </p>

        {!isInTable ? (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs h-7 gap-2"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
          >
            <IconTable className="h-3.5 w-3.5" />
            Insert 3×3 Table
          </Button>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-7 gap-2"
              onClick={() => editor.chain().focus().addRowAfter().run()}
            >
              <IconRowInsertBottom className="h-3.5 w-3.5" />
              Add Row Below
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-7 gap-2"
              onClick={() => editor.chain().focus().addRowBefore().run()}
            >
              <IconRowInsertTop className="h-3.5 w-3.5" />
              Add Row Above
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-7 gap-2"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
            >
              <IconColumnInsertRight className="h-3.5 w-3.5" />
              Add Column Right
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-7 gap-2"
              onClick={() => editor.chain().focus().addColumnBefore().run()}
            >
              <IconColumnInsertLeft className="h-3.5 w-3.5" />
              Add Column Left
            </Button>
            <div className="h-px bg-border my-1" />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-7 gap-2 text-destructive hover:text-destructive"
              onClick={() => editor.chain().focus().deleteRow().run()}
            >
              <IconTrash className="h-3.5 w-3.5" />
              Delete Current Row
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-7 gap-2 text-destructive hover:text-destructive"
              onClick={() => editor.chain().focus().deleteColumn().run()}
            >
              <IconTrash className="h-3.5 w-3.5" />
              Delete Current Column
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-7 gap-2 text-destructive hover:text-destructive"
              onClick={() => editor.chain().focus().deleteTable().run()}
            >
              <IconTrash className="h-3.5 w-3.5" />
              Delete Entire Table
            </Button>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
