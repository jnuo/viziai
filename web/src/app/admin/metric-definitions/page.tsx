"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  X,
  Check,
  Search,
} from "lucide-react";

interface MetricDefinition {
  id: string;
  key: string;
  category: string | null;
  canonical_unit: string | null;
  value_type: string;
  created_at: string;
  translation_count: number;
  alias_count: number;
  ref_range_count: number;
}

interface Translation {
  id: string;
  locale: string;
  display_name: string;
}

interface Alias {
  id: string;
  alias: string;
  canonical_name: string;
}

interface RefRange {
  id: string;
  sex: string | null;
  age_min: number | null;
  age_max: number | null;
  ref_low: number | null;
  ref_high: number | null;
}

interface ExpandedData {
  translations: Translation[];
  aliases: Alias[];
  refRanges: RefRange[];
}

type ActiveTab = "translations" | "aliases" | "refRanges";

export default function MetricDefinitionsPage() {
  const [definitions, setDefinitions] = useState<MetricDefinition[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Expanded row state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<ExpandedData | null>(null);
  const [expandedLoading, setExpandedLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("translations");

  // Create/edit modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDefinition, setEditingDefinition] =
    useState<MetricDefinition | null>(null);
  const [formData, setFormData] = useState({
    key: "",
    category: "",
    canonicalUnit: "",
    valueType: "quantitative",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Inline add state
  const [addingTranslation, setAddingTranslation] = useState(false);
  const [newTranslation, setNewTranslation] = useState({
    locale: "",
    displayName: "",
  });
  const [addingAlias, setAddingAlias] = useState(false);
  const [newAlias, setNewAlias] = useState("");
  const [addingRefRange, setAddingRefRange] = useState(false);
  const [newRefRange, setNewRefRange] = useState({
    sex: "",
    ageMin: "",
    ageMax: "",
    refLow: "",
    refHigh: "",
  });

  // Editing translation state
  const [editingTranslation, setEditingTranslation] =
    useState<Translation | null>(null);
  const [editTranslationData, setEditTranslationData] = useState({
    locale: "",
    displayName: "",
  });

  // Editing ref range state
  const [editingRefRange, setEditingRefRange] = useState<RefRange | null>(null);
  const [editRefRangeData, setEditRefRangeData] = useState({
    sex: "",
    ageMin: "",
    ageMax: "",
    refLow: "",
    refHigh: "",
  });

  const fetchDefinitions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (selectedCategory) params.set("category", selectedCategory);

      const res = await fetch(`/api/admin/metric-definitions?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setDefinitions(data.items);
      setCategories(data.categories || []);
    } catch {
      setError("Failed to load metric definitions");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    fetchDefinitions();
  }, [fetchDefinitions]);

  async function fetchExpandedData(id: string) {
    setExpandedLoading(true);
    try {
      const res = await fetch(`/api/admin/metric-definitions/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setExpandedData({
        translations: data.translations,
        aliases: data.aliases,
        refRanges: data.refRanges,
      });
    } catch {
      setExpandedData(null);
    } finally {
      setExpandedLoading(false);
    }
  }

  function handleExpand(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedData(null);
    } else {
      setExpandedId(id);
      setActiveTab("translations");
      fetchExpandedData(id);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this metric definition and all related data?")) return;
    try {
      const res = await fetch(`/api/admin/metric-definitions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      fetchDefinitions();
      if (expandedId === id) {
        setExpandedId(null);
        setExpandedData(null);
      }
    } catch {
      alert("Failed to delete metric definition");
    }
  }

  async function handleCreateOrUpdate(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      const url = editingDefinition
        ? `/api/admin/metric-definitions/${editingDefinition.id}`
        : "/api/admin/metric-definitions";
      const method = editingDefinition ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setShowCreateModal(false);
      setEditingDefinition(null);
      setFormData({
        key: "",
        category: "",
        canonicalUnit: "",
        valueType: "quantitative",
      });
      fetchDefinitions();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setFormLoading(false);
    }
  }

  function openEditModal(def: MetricDefinition) {
    setEditingDefinition(def);
    setFormData({
      key: def.key,
      category: def.category || "",
      canonicalUnit: def.canonical_unit || "",
      valueType: def.value_type,
    });
    setShowCreateModal(true);
  }

  function closeModal() {
    setShowCreateModal(false);
    setEditingDefinition(null);
    setFormData({
      key: "",
      category: "",
      canonicalUnit: "",
      valueType: "quantitative",
    });
    setFormError(null);
  }

  async function addTranslation() {
    if (!expandedId || !newTranslation.locale || !newTranslation.displayName)
      return;
    try {
      const res = await fetch(
        `/api/admin/metric-definitions/${expandedId}/translations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTranslation),
        },
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add");
      }
      setAddingTranslation(false);
      setNewTranslation({ locale: "", displayName: "" });
      fetchExpandedData(expandedId);
      fetchDefinitions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add translation");
    }
  }

  async function updateTranslation() {
    if (!expandedId || !editingTranslation) return;
    try {
      const res = await fetch(
        `/api/admin/metric-definitions/${expandedId}/translations/${editingTranslation.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locale: editTranslationData.locale,
            displayName: editTranslationData.displayName,
          }),
        },
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
      setEditingTranslation(null);
      fetchExpandedData(expandedId);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to update translation",
      );
    }
  }

  async function deleteTranslation(translationId: string) {
    if (!expandedId) return;
    if (!confirm("Delete this translation?")) return;
    try {
      const res = await fetch(
        `/api/admin/metric-definitions/${expandedId}/translations/${translationId}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Failed to delete");
      fetchExpandedData(expandedId);
      fetchDefinitions();
    } catch {
      alert("Failed to delete translation");
    }
  }

  async function addAlias() {
    if (!expandedId || !newAlias) return;
    try {
      const res = await fetch(
        `/api/admin/metric-definitions/${expandedId}/aliases`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alias: newAlias }),
        },
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add");
      }
      setAddingAlias(false);
      setNewAlias("");
      fetchExpandedData(expandedId);
      fetchDefinitions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add alias");
    }
  }

  async function deleteAlias(aliasId: string) {
    if (!expandedId) return;
    if (!confirm("Delete this alias?")) return;
    try {
      const res = await fetch(
        `/api/admin/metric-definitions/${expandedId}/aliases/${aliasId}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Failed to delete");
      fetchExpandedData(expandedId);
      fetchDefinitions();
    } catch {
      alert("Failed to delete alias");
    }
  }

  async function addRefRange() {
    if (!expandedId) return;
    const { sex, ageMin, ageMax, refLow, refHigh } = newRefRange;
    if (!refLow && !refHigh) {
      alert("At least one of refLow or refHigh is required");
      return;
    }
    try {
      const res = await fetch(
        `/api/admin/metric-definitions/${expandedId}/ref-ranges`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sex: sex || null,
            ageMin: ageMin ? parseInt(ageMin) : null,
            ageMax: ageMax ? parseInt(ageMax) : null,
            refLow: refLow ? parseFloat(refLow) : null,
            refHigh: refHigh ? parseFloat(refHigh) : null,
          }),
        },
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add");
      }
      setAddingRefRange(false);
      setNewRefRange({
        sex: "",
        ageMin: "",
        ageMax: "",
        refLow: "",
        refHigh: "",
      });
      fetchExpandedData(expandedId);
      fetchDefinitions();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to add reference range",
      );
    }
  }

  async function updateRefRange() {
    if (!expandedId || !editingRefRange) return;
    const { sex, ageMin, ageMax, refLow, refHigh } = editRefRangeData;
    try {
      const res = await fetch(
        `/api/admin/metric-definitions/${expandedId}/ref-ranges/${editingRefRange.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sex: sex || null,
            ageMin: ageMin ? parseInt(ageMin) : null,
            ageMax: ageMax ? parseInt(ageMax) : null,
            refLow: refLow ? parseFloat(refLow) : null,
            refHigh: refHigh ? parseFloat(refHigh) : null,
          }),
        },
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
      setEditingRefRange(null);
      fetchExpandedData(expandedId);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to update reference range",
      );
    }
  }

  async function deleteRefRange(rangeId: string) {
    if (!expandedId) return;
    if (!confirm("Delete this reference range?")) return;
    try {
      const res = await fetch(
        `/api/admin/metric-definitions/${expandedId}/ref-ranges/${rangeId}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Failed to delete");
      fetchExpandedData(expandedId);
      fetchDefinitions();
    } catch {
      alert("Failed to delete reference range");
    }
  }

  function startEditTranslation(t: Translation) {
    setEditingTranslation(t);
    setEditTranslationData({ locale: t.locale, displayName: t.display_name });
  }

  function startEditRefRange(r: RefRange) {
    setEditingRefRange(r);
    setEditRefRangeData({
      sex: r.sex || "",
      ageMin: r.age_min?.toString() || "",
      ageMax: r.age_max?.toString() || "",
      refLow: r.ref_low?.toString() || "",
      refHigh: r.ref_high?.toString() || "",
    });
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Metric Definitions</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="size-4 mr-2" />
          Add Definition
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by key..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : definitions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No metric definitions found.
            </p>
          ) : (
            <div className="divide-y">
              {definitions.map((def) => (
                <div key={def.id}>
                  {/* Main row */}
                  <div
                    className="flex items-center gap-4 py-3 hover:bg-muted/50 px-2 -mx-2 rounded cursor-pointer"
                    onClick={() => handleExpand(def.id)}
                  >
                    <div className="text-muted-foreground">
                      {expandedId === def.id ? (
                        <ChevronDown className="size-4" />
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{def.key}</div>
                      <div className="text-sm text-muted-foreground">
                        {def.category || "No category"}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {def.canonical_unit || "-"}
                    </div>
                    <Badge variant="outline">{def.value_type}</Badge>
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        {def.translation_count} trans
                      </Badge>
                      <Badge variant="secondary">{def.alias_count} alias</Badge>
                      <Badge variant="secondary">
                        {def.ref_range_count} ranges
                      </Badge>
                    </div>
                    <div
                      className="flex gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(def)}
                        aria-label="Edit definition"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(def.id)}
                        aria-label="Delete definition"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {expandedId === def.id && (
                    <div className="pb-4 pl-8 pr-2">
                      <div className="flex gap-2 mb-4 border-b">
                        {(
                          [
                            { key: "translations", label: "Translations" },
                            { key: "aliases", label: "Aliases" },
                            { key: "refRanges", label: "Reference Ranges" },
                          ] as { key: ActiveTab; label: string }[]
                        ).map((tab) => (
                          <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                              activeTab === tab.key
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {expandedLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      ) : !expandedData ? (
                        <p className="text-muted-foreground">
                          Failed to load data
                        </p>
                      ) : (
                        <>
                          {/* Translations tab */}
                          {activeTab === "translations" && (
                            <div className="space-y-2">
                              {expandedData.translations.length === 0 &&
                                !addingTranslation && (
                                  <p className="text-sm text-muted-foreground">
                                    No translations yet.
                                  </p>
                                )}
                              {expandedData.translations.map((t) =>
                                editingTranslation?.id === t.id ? (
                                  <div
                                    key={t.id}
                                    className="flex items-center gap-2 bg-muted/50 p-2 rounded"
                                  >
                                    <Input
                                      value={editTranslationData.locale}
                                      onChange={(e) =>
                                        setEditTranslationData({
                                          ...editTranslationData,
                                          locale: e.target.value,
                                        })
                                      }
                                      placeholder="Locale"
                                      className="w-20"
                                    />
                                    <Input
                                      value={editTranslationData.displayName}
                                      onChange={(e) =>
                                        setEditTranslationData({
                                          ...editTranslationData,
                                          displayName: e.target.value,
                                        })
                                      }
                                      placeholder="Display name"
                                      className="flex-1"
                                    />
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={updateTranslation}
                                      aria-label="Save"
                                    >
                                      <Check className="size-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() =>
                                        setEditingTranslation(null)
                                      }
                                      aria-label="Cancel"
                                    >
                                      <X className="size-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div
                                    key={t.id}
                                    className="flex items-center gap-2 text-sm"
                                  >
                                    <Badge
                                      variant="outline"
                                      className="w-12 justify-center"
                                    >
                                      {t.locale}
                                    </Badge>
                                    <span className="flex-1">
                                      {t.display_name}
                                    </span>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => startEditTranslation(t)}
                                      aria-label="Edit"
                                    >
                                      <Pencil className="size-3" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => deleteTranslation(t.id)}
                                      aria-label="Delete"
                                    >
                                      <Trash2 className="size-3 text-destructive" />
                                    </Button>
                                  </div>
                                ),
                              )}
                              {addingTranslation ? (
                                <div className="flex items-center gap-2 bg-muted/50 p-2 rounded">
                                  <Input
                                    value={newTranslation.locale}
                                    onChange={(e) =>
                                      setNewTranslation({
                                        ...newTranslation,
                                        locale: e.target.value,
                                      })
                                    }
                                    placeholder="Locale (e.g., tr)"
                                    className="w-20"
                                  />
                                  <Input
                                    value={newTranslation.displayName}
                                    onChange={(e) =>
                                      setNewTranslation({
                                        ...newTranslation,
                                        displayName: e.target.value,
                                      })
                                    }
                                    placeholder="Display name"
                                    className="flex-1"
                                  />
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={addTranslation}
                                    aria-label="Add"
                                  >
                                    <Check className="size-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setAddingTranslation(false)}
                                    aria-label="Cancel"
                                  >
                                    <X className="size-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setAddingTranslation(true)}
                                >
                                  <Plus className="size-3 mr-1" />
                                  Add Translation
                                </Button>
                              )}
                            </div>
                          )}

                          {/* Aliases tab */}
                          {activeTab === "aliases" && (
                            <div className="space-y-2">
                              {expandedData.aliases.length === 0 &&
                                !addingAlias && (
                                  <p className="text-sm text-muted-foreground">
                                    No aliases yet.
                                  </p>
                                )}
                              {expandedData.aliases.map((a) => (
                                <div
                                  key={a.id}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <span className="flex-1 font-mono">
                                    {a.alias}
                                  </span>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => deleteAlias(a.id)}
                                    aria-label="Delete"
                                  >
                                    <Trash2 className="size-3 text-destructive" />
                                  </Button>
                                </div>
                              ))}
                              {addingAlias ? (
                                <div className="flex items-center gap-2 bg-muted/50 p-2 rounded">
                                  <Input
                                    value={newAlias}
                                    onChange={(e) =>
                                      setNewAlias(e.target.value)
                                    }
                                    placeholder="Alias name"
                                    className="flex-1"
                                  />
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={addAlias}
                                    aria-label="Add"
                                  >
                                    <Check className="size-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setAddingAlias(false)}
                                    aria-label="Cancel"
                                  >
                                    <X className="size-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setAddingAlias(true)}
                                >
                                  <Plus className="size-3 mr-1" />
                                  Add Alias
                                </Button>
                              )}
                            </div>
                          )}

                          {/* Reference Ranges tab */}
                          {activeTab === "refRanges" && (
                            <div className="space-y-2">
                              {expandedData.refRanges.length === 0 &&
                                !addingRefRange && (
                                  <p className="text-sm text-muted-foreground">
                                    No reference ranges yet.
                                  </p>
                                )}
                              <div className="text-xs text-muted-foreground grid grid-cols-6 gap-2 px-2">
                                <span>Sex</span>
                                <span>Age Min</span>
                                <span>Age Max</span>
                                <span>Ref Low</span>
                                <span>Ref High</span>
                                <span></span>
                              </div>
                              {expandedData.refRanges.map((r) =>
                                editingRefRange?.id === r.id ? (
                                  <div
                                    key={r.id}
                                    className="grid grid-cols-6 gap-2 bg-muted/50 p-2 rounded"
                                  >
                                    <select
                                      value={editRefRangeData.sex}
                                      onChange={(e) =>
                                        setEditRefRangeData({
                                          ...editRefRangeData,
                                          sex: e.target.value,
                                        })
                                      }
                                      className="h-8 px-2 rounded border bg-background text-sm"
                                    >
                                      <option value="">All</option>
                                      <option value="M">M</option>
                                      <option value="F">F</option>
                                    </select>
                                    <Input
                                      type="number"
                                      value={editRefRangeData.ageMin}
                                      onChange={(e) =>
                                        setEditRefRangeData({
                                          ...editRefRangeData,
                                          ageMin: e.target.value,
                                        })
                                      }
                                      placeholder="-"
                                      className="h-8"
                                    />
                                    <Input
                                      type="number"
                                      value={editRefRangeData.ageMax}
                                      onChange={(e) =>
                                        setEditRefRangeData({
                                          ...editRefRangeData,
                                          ageMax: e.target.value,
                                        })
                                      }
                                      placeholder="-"
                                      className="h-8"
                                    />
                                    <Input
                                      type="number"
                                      step="any"
                                      value={editRefRangeData.refLow}
                                      onChange={(e) =>
                                        setEditRefRangeData({
                                          ...editRefRangeData,
                                          refLow: e.target.value,
                                        })
                                      }
                                      placeholder="-"
                                      className="h-8"
                                    />
                                    <Input
                                      type="number"
                                      step="any"
                                      value={editRefRangeData.refHigh}
                                      onChange={(e) =>
                                        setEditRefRangeData({
                                          ...editRefRangeData,
                                          refHigh: e.target.value,
                                        })
                                      }
                                      placeholder="-"
                                      className="h-8"
                                    />
                                    <div className="flex gap-1">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={updateRefRange}
                                        aria-label="Save"
                                      >
                                        <Check className="size-4" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => setEditingRefRange(null)}
                                        aria-label="Cancel"
                                      >
                                        <X className="size-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    key={r.id}
                                    className="grid grid-cols-6 gap-2 text-sm items-center px-2"
                                  >
                                    <span>{r.sex || "All"}</span>
                                    <span>{r.age_min ?? "-"}</span>
                                    <span>{r.age_max ?? "-"}</span>
                                    <span>{r.ref_low ?? "-"}</span>
                                    <span>{r.ref_high ?? "-"}</span>
                                    <div className="flex gap-1">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => startEditRefRange(r)}
                                        aria-label="Edit"
                                      >
                                        <Pencil className="size-3" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => deleteRefRange(r.id)}
                                        aria-label="Delete"
                                      >
                                        <Trash2 className="size-3 text-destructive" />
                                      </Button>
                                    </div>
                                  </div>
                                ),
                              )}
                              {addingRefRange ? (
                                <div className="grid grid-cols-6 gap-2 bg-muted/50 p-2 rounded">
                                  <select
                                    value={newRefRange.sex}
                                    onChange={(e) =>
                                      setNewRefRange({
                                        ...newRefRange,
                                        sex: e.target.value,
                                      })
                                    }
                                    className="h-8 px-2 rounded border bg-background text-sm"
                                  >
                                    <option value="">All</option>
                                    <option value="M">M</option>
                                    <option value="F">F</option>
                                  </select>
                                  <Input
                                    type="number"
                                    value={newRefRange.ageMin}
                                    onChange={(e) =>
                                      setNewRefRange({
                                        ...newRefRange,
                                        ageMin: e.target.value,
                                      })
                                    }
                                    placeholder="Age min"
                                    className="h-8"
                                  />
                                  <Input
                                    type="number"
                                    value={newRefRange.ageMax}
                                    onChange={(e) =>
                                      setNewRefRange({
                                        ...newRefRange,
                                        ageMax: e.target.value,
                                      })
                                    }
                                    placeholder="Age max"
                                    className="h-8"
                                  />
                                  <Input
                                    type="number"
                                    step="any"
                                    value={newRefRange.refLow}
                                    onChange={(e) =>
                                      setNewRefRange({
                                        ...newRefRange,
                                        refLow: e.target.value,
                                      })
                                    }
                                    placeholder="Ref low"
                                    className="h-8"
                                  />
                                  <Input
                                    type="number"
                                    step="any"
                                    value={newRefRange.refHigh}
                                    onChange={(e) =>
                                      setNewRefRange({
                                        ...newRefRange,
                                        refHigh: e.target.value,
                                      })
                                    }
                                    placeholder="Ref high"
                                    className="h-8"
                                  />
                                  <div className="flex gap-1">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={addRefRange}
                                      aria-label="Add"
                                    >
                                      <Check className="size-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => setAddingRefRange(false)}
                                      aria-label="Cancel"
                                    >
                                      <X className="size-4" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setAddingRefRange(true)}
                                >
                                  <Plus className="size-3 mr-1" />
                                  Add Reference Range
                                </Button>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {editingDefinition
                  ? "Edit Metric Definition"
                  : "Add Metric Definition"}
              </CardTitle>
              <CardDescription>
                {editingDefinition
                  ? "Update the metric definition details."
                  : "Create a new metric definition."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="key">Key (slug)</Label>
                  <Input
                    id="key"
                    value={formData.key}
                    onChange={(e) =>
                      setFormData({ ...formData, key: e.target.value })
                    }
                    placeholder="e.g., hemoglobin"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="e.g., CBC"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="canonicalUnit">Canonical Unit</Label>
                  <Input
                    id="canonicalUnit"
                    value={formData.canonicalUnit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        canonicalUnit: e.target.value,
                      })
                    }
                    placeholder="e.g., g/dL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valueType">Value Type</Label>
                  <select
                    id="valueType"
                    value={formData.valueType}
                    onChange={(e) =>
                      setFormData({ ...formData, valueType: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="quantitative">Quantitative</option>
                    <option value="qualitative">Qualitative</option>
                  </select>
                </div>
                {formError && (
                  <p className="text-sm text-destructive">{formError}</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={formLoading}>
                    {formLoading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
