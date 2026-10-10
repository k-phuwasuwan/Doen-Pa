"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createImageImporter, readBrowserImage } from "./images/image-import";

export function useImageImport() {
  const [importer] = useState(() => createImageImporter(readBrowserImage));
  const pending = useSyncExternalStore(importer.subscribe, importer.getSnapshot, importer.getServerSnapshot);
  useEffect(() => () => importer.cancelAll(), [importer]);
  return { importer, loading: pending.length > 0 };
}
