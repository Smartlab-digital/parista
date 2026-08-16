"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "parista-visual-editor-overrides";

type Overrides = Record<string, Record<string, string>>;

type PropertyDef = {
  key: string;
  label: string;
  type?: "text" | "number" | "color" | "select";
  unit?: string;
  options?: string[];
  placeholder?: string;
};

type PropertyGroup = {
  title: string;
  props: PropertyDef[];
};

const PROPERTY_GROUPS: PropertyGroup[] = [
  {
    title: "Макет",
    props: [
      { key: "display", label: "display", type: "select", options: ["", "block", "flex", "grid", "inline", "inline-flex", "none"] },
      { key: "flex-direction", label: "flex-direction", type: "select", options: ["", "row", "column", "row-reverse", "column-reverse"] },
      { key: "justify-content", label: "justify-content", type: "select", options: ["", "flex-start", "center", "flex-end", "space-between", "space-around"] },
      { key: "align-items", label: "align-items", type: "select", options: ["", "flex-start", "center", "flex-end", "stretch", "baseline"] },
      { key: "gap", label: "gap", placeholder: "16px" },
      { key: "grid-template-columns", label: "grid-columns", placeholder: "1fr 1fr" },
    ],
  },
  {
    title: "Размеры",
    props: [
      { key: "width", label: "width", placeholder: "100%" },
      { key: "height", label: "height", placeholder: "auto" },
      { key: "min-height", label: "min-height", placeholder: "0" },
      { key: "max-width", label: "max-width", placeholder: "none" },
    ],
  },
  {
    title: "Отступы",
    props: [
      { key: "margin-top", label: "margin-top", placeholder: "0" },
      { key: "margin-right", label: "margin-right", placeholder: "0" },
      { key: "margin-bottom", label: "margin-bottom", placeholder: "0" },
      { key: "margin-left", label: "margin-left", placeholder: "0" },
      { key: "padding-top", label: "padding-top", placeholder: "0" },
      { key: "padding-right", label: "padding-right", placeholder: "0" },
      { key: "padding-bottom", label: "padding-bottom", placeholder: "0" },
      { key: "padding-left", label: "padding-left", placeholder: "0" },
    ],
  },
  {
    title: "Типографика",
    props: [
      { key: "font-size", label: "font-size", placeholder: "16px" },
      { key: "font-weight", label: "font-weight", placeholder: "400" },
      { key: "line-height", label: "line-height", placeholder: "1.5" },
      { key: "letter-spacing", label: "letter-spacing", placeholder: "0" },
      { key: "text-align", label: "text-align", type: "select", options: ["", "left", "center", "right", "justify"] },
    ],
  },
  {
    title: "Цвета",
    props: [
      { key: "color", label: "color", type: "color" },
      { key: "background-color", label: "background", type: "color" },
    ],
  },
  {
    title: "Позиция",
    props: [
      { key: "position", label: "position", type: "select", options: ["", "static", "relative", "absolute", "fixed", "sticky"] },
      { key: "top", label: "top", placeholder: "auto" },
      { key: "right", label: "right", placeholder: "auto" },
      { key: "bottom", label: "bottom", placeholder: "auto" },
      { key: "left", label: "left", placeholder: "auto" },
      { key: "z-index", label: "z-index", placeholder: "auto" },
    ],
  },
  {
    title: "Эффекты",
    props: [
      { key: "border-radius", label: "border-radius", placeholder: "0" },
      { key: "opacity", label: "opacity", placeholder: "1" },
      { key: "transform", label: "transform", placeholder: "none" },
      { key: "box-shadow", label: "box-shadow", placeholder: "none" },
    ],
  },
];

function loadOverrides(): Overrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Overrides) : {};
  } catch {
    return {};
  }
}

function saveOverrides(overrides: Overrides) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

function getElementSelector(el: Element): string {
  if (el.id) return `#${CSS.escape(el.id)}`;

  const classes = Array.from(el.classList).filter(
    (c) => !c.startsWith("ve-") && c !== "site",
  );
  if (classes.length) {
    const selector = `${el.tagName.toLowerCase()}.${classes.map((c) => CSS.escape(c)).join(".")}`;
    if (document.querySelectorAll(selector).length === 1) return selector;
    const parent = el.parentElement;
    if (parent) {
      const scoped = `${getElementSelector(parent)} > ${selector}`;
      if (document.querySelectorAll(scoped).length === 1) return scoped;
    }
  }

  const parts: string[] = [];
  let current: Element | null = el;
  while (current && current.tagName !== "HTML") {
    const tag = current.tagName.toLowerCase();
    const parentEl = current.parentElement;
    if (!parentEl) {
      parts.unshift(tag);
      break;
    }
    const siblings = Array.from(parentEl.children).filter((c) => c.tagName === current!.tagName);
    const index = siblings.indexOf(current) + 1;
    parts.unshift(`${tag}:nth-of-type(${index})`);
    current = parentEl;
    if (current.classList.contains("site")) break;
  }
  return parts.join(" > ");
}

function overridesToCss(overrides: Overrides): string {
  return Object.entries(overrides)
    .filter(([, props]) => Object.keys(props).length > 0)
    .map(([selector, props]) => {
      const body = Object.entries(props)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join("\n");
      return `${selector} {\n${body}\n}`;
    })
    .join("\n\n");
}

function rgbToHex(color: string): string {
  if (color.startsWith("#")) return color;
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return "#000000";
  const [, r, g, b] = match;
  return `#${[r, g, b].map((n) => Number(n).toString(16).padStart(2, "0")).join("")}`;
}

function isEditorElement(el: Element | null): boolean {
  return !!el?.closest(".visual-editor-ui, .visual-editor-ui *");
}

type VisualEditorContextValue = {
  editMode: boolean;
  setEditMode: (v: boolean) => void;
};

const VisualEditorContext = createContext<VisualEditorContextValue | null>(null);

export function useVisualEditor() {
  const ctx = useContext(VisualEditorContext);
  if (!ctx) throw new Error("useVisualEditor must be used within VisualEditorProvider");
  return ctx;
}

function InspectorField({
  def,
  value,
  computed,
  onChange,
}: {
  def: PropertyDef;
  value: string;
  computed: string;
  onChange: (v: string) => void;
}) {
  const displayValue = value || "";

  if (def.type === "select") {
    return (
      <label className="ve-field">
        <span>{def.label}</span>
        <select value={displayValue} onChange={(e) => onChange(e.target.value)}>
          {(def.options ?? []).map((opt) => (
            <option key={opt || "inherit"} value={opt}>
              {opt || computed || "— наследуется —"}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (def.type === "color") {
    const hex = displayValue ? rgbToHex(displayValue) : rgbToHex(computed);
    return (
      <label className="ve-field ve-field-color">
        <span>{def.label}</span>
        <div className="ve-color-row">
          <input type="color" value={hex} onChange={(e) => onChange(e.target.value)} />
          <input
            type="text"
            value={displayValue}
            placeholder={computed}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </label>
    );
  }

  return (
    <label className="ve-field">
      <span>{def.label}</span>
      <input
        type="text"
        value={displayValue}
        placeholder={computed || def.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function VisualEditorPanel({
  selected,
  selector,
  overrides,
  onChangeProperty,
  onResetElement,
  onResetAll,
  onExport,
  onClose,
}: {
  selected: Element;
  selector: string;
  overrides: Overrides;
  onChangeProperty: (prop: string, value: string) => void;
  onResetElement: () => void;
  onResetAll: () => void;
  onExport: () => void;
  onClose: () => void;
}) {
  const computed = useMemo(() => getComputedStyle(selected), [selected]);
  const elementOverrides = overrides[selector] ?? {};
  const [copied, setCopied] = useState(false);

  const handleExport = async () => {
    onExport();
    const css = overridesToCss(overrides);
    try {
      await navigator.clipboard.writeText(css);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <aside className="visual-editor-panel" aria-label="Инспектор вёрстки">
      <header className="ve-panel-header">
        <div>
          <strong>{selected.tagName.toLowerCase()}</strong>
          {selected.className && typeof selected.className === "string" && (
            <code className="ve-class-list">.{selected.className.split(" ").filter(Boolean).slice(0, 3).join(".")}</code>
          )}
        </div>
        <button type="button" className="ve-close" onClick={onClose} aria-label="Закрыть редактор">
          ×
        </button>
      </header>

      <p className="ve-selector" title={selector}>{selector}</p>

      <div className="ve-panel-body">
        {PROPERTY_GROUPS.map((group) => (
          <details key={group.title} className="ve-group" open={group.title === "Макет" || group.title === "Отступы"}>
            <summary>{group.title}</summary>
            <div className="ve-fields">
              {group.props.map((def) => (
                <InspectorField
                  key={def.key}
                  def={def}
                  value={elementOverrides[def.key] ?? ""}
                  computed={computed.getPropertyValue(def.key) || ""}
                  onChange={(v) => onChangeProperty(def.key, v)}
                />
              ))}
            </div>
          </details>
        ))}
      </div>

      <footer className="ve-panel-footer">
        <button type="button" onClick={onResetElement}>Сбросить элемент</button>
        <button type="button" onClick={onResetAll}>Сбросить всё</button>
        <button type="button" className="ve-primary" onClick={handleExport}>
          {copied ? "Скопировано ✓" : "Экспорт CSS"}
        </button>
      </footer>
    </aside>
  );
}

function VisualEditorOverlay({
  editMode,
  setEditMode,
}: {
  editMode: boolean;
  setEditMode: (v: boolean) => void;
}) {
  const [overrides, setOverrides] = useState<Overrides>(() => loadOverrides());
  const [selected, setSelected] = useState<Element | null>(null);
  const [hovered, setHovered] = useState<Element | null>(null);
  const [dragState, setDragState] = useState<{ startX: number; startY: number; origTop: number; origLeft: number } | null>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef<HTMLDivElement>(null);

  const selector = selected ? getElementSelector(selected) : "";

  useEffect(() => {
    let style = document.getElementById("visual-editor-overrides") as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = "visual-editor-overrides";
      document.head.appendChild(style);
    }
    styleRef.current = style;
    style.textContent = overridesToCss(overrides);
    saveOverrides(overrides);
  }, [overrides]);

  const updateHighlight = useCallback((el: Element | null, box: HTMLDivElement | null) => {
    if (!el || !box || isEditorElement(el)) {
      if (box) box.style.display = "none";
      return;
    }
    const rect = el.getBoundingClientRect();
    box.style.display = "block";
    box.style.top = `${rect.top}px`;
    box.style.left = `${rect.left}px`;
    box.style.width = `${rect.width}px`;
    box.style.height = `${rect.height}px`;
  }, []);

  useEffect(() => {
    updateHighlight(selected, highlightRef.current);
    updateHighlight(hovered, hoverRef.current);
  }, [selected, hovered, editMode, updateHighlight]);

  useEffect(() => {
    const onScroll = () => {
      updateHighlight(selected, highlightRef.current);
      updateHighlight(hovered, hoverRef.current);
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [selected, hovered, updateHighlight]);

  useEffect(() => {
    if (!editMode) {
      document.body.classList.remove("ve-editing");
      return;
    }
    document.body.classList.add("ve-editing");

    const onMouseMove = (e: MouseEvent) => {
      if (dragState) return;
      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (!target || isEditorElement(target)) {
        setHovered(null);
        return;
      }
      setHovered(target);
    };

    const onClick = (e: MouseEvent) => {
      if (dragState) return;
      const target = e.target as Element;
      if (isEditorElement(target)) return;
      e.preventDefault();
      e.stopPropagation();
      setSelected(target);
    };

    document.addEventListener("mousemove", onMouseMove, true);
    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("mousemove", onMouseMove, true);
      document.removeEventListener("click", onClick, true);
    };
  }, [editMode, dragState]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selected) setSelected(null);
        else {
          setHovered(null);
          setEditMode(false);
        }
      }
      if (e.key === "e" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setEditMode(!editMode);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editMode, selected, setEditMode]);

  const changeProperty = useCallback(
    (prop: string, value: string) => {
      if (!selector) return;
      setOverrides((prev) => {
        const next = { ...prev };
        const props = { ...(next[selector] ?? {}) };
        if (value) props[prop] = value;
        else delete props[prop];
        if (Object.keys(props).length === 0) delete next[selector];
        else next[selector] = props;
        return next;
      });
    },
    [selector],
  );

  const onMouseDownDrag = useCallback(
    (e: React.MouseEvent) => {
      if (!selected || !editMode) return;
      const style = getComputedStyle(selected);
      if (style.position === "static") return;
      e.preventDefault();
      const top = parseFloat(style.top) || 0;
      const left = parseFloat(style.left) || 0;
      setDragState({ startX: e.clientX, startY: e.clientY, origTop: top, origLeft: left });
    },
    [selected, editMode],
  );

  useEffect(() => {
    if (!dragState || !selected || !selector) return;

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      changeProperty("top", `${dragState.origTop + dy}px`);
      changeProperty("left", `${dragState.origLeft + dx}px`);
    };

    const onUp = () => setDragState(null);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragState, selected, selector, changeProperty]);

  const resetElement = () => {
    if (!selector) return;
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[selector];
      return next;
    });
  };

  const resetAll = () => {
    setOverrides({});
    setSelected(null);
  };

  const overrideCount = Object.keys(overrides).length;

  return (
    <div className="visual-editor-ui">
      <button
        type="button"
        className={`ve-toggle ${editMode ? "active" : ""}`}
        onClick={() => {
          if (editMode) {
            setSelected(null);
            setHovered(null);
          }
          setEditMode(!editMode);
        }}
        title="Визуальный редактор (⌘E)"
      >
        ✎ {editMode ? "Редактор вкл." : "Редактор"}
        {overrideCount > 0 && !editMode && <em>{overrideCount}</em>}
      </button>

      {editMode && (
        <div className="ve-hint">
          Клик — выбрать элемент · Перетаскивание — сдвиг (position ≠ static) · Esc — выход
        </div>
      )}

      <div ref={hoverRef} className="ve-highlight ve-highlight-hover" aria-hidden="true" />
      <div
        ref={highlightRef}
        className="ve-highlight ve-highlight-selected"
        aria-hidden="true"
        onMouseDown={onMouseDownDrag}
      />

      {editMode && selected && (
        <VisualEditorPanel
          selected={selected}
          selector={selector}
          overrides={overrides}
          onChangeProperty={changeProperty}
          onResetElement={resetElement}
          onResetAll={resetAll}
          onExport={() => {}}
          onClose={() => {
            setSelected(null);
            setHovered(null);
            setEditMode(false);
          }}
        />
      )}
    </div>
  );
}

export function VisualEditorProvider({ children }: { children: ReactNode }) {
  const [editMode, setEditModeRaw] = useState(false);
  const [editorEnabled, setEditorEnabled] = useState(false);

  useEffect(() => {
    setEditorEnabled(["localhost", "127.0.0.1"].includes(window.location.hostname));
  }, []);

  const setEditMode = useCallback((v: boolean) => {
    setEditModeRaw(v);
  }, []);

  return (
    <VisualEditorContext.Provider value={{ editMode, setEditMode }}>
      {children}
      {editorEnabled && <VisualEditorOverlay editMode={editMode} setEditMode={setEditMode} />}
    </VisualEditorContext.Provider>
  );
}
