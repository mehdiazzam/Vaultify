import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "../ui/Input";
import DatePickerInput from "../ui/DatePicker";
import { Combobox } from "../ui/Combobox";
import { Button } from "../ui/Button";
import { useFinanceStore } from "../../stores/financeStore";
import type { Transaction } from "../../types";

interface Props {
  onSubmit: (data: {
    categoryId: string;
    description: string;
    date: string;
    items: Array<{ accountId: string; debit: number; credit: number }>;
  }) => void | Promise<void>;
  onCancel: () => void;
  initial?: Transaction;
  loading?: boolean;
  error?: string;
}

export function IncomeTrxForm({
  onSubmit,
  onCancel,
  initial,
  loading,
  error,
}: Props) {
  const { accounts, categories } = useFinanceStore();

  const initialAssetAccountId =
    initial?.items.find((item) => item.debit > 0)?.accountId ?? "";
  const initialAmount = initial?.items.find((item) => item.debit > 0);

  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [date, setDate] = useState(
    initial?.date ?? new Date().toISOString().split("T")[0],
  );
  const [assetAccountId, setAssetAccountId] = useState(initialAssetAccountId);
  const [amount, setAmount] = useState(
    initialAmount ? String(initialAmount.debit) : "",
  );
  const [formError, setFormError] = useState("");

  const categoryOptions = categories
    .filter((c) => c.type === "income")
    .map((c) => ({ value: c.id, label: c.name }));
  const assetAccountOptions = accounts
    .filter(
      (a) =>
        a.accounting === "asset" && !a.parentId && !a.disabled && !a.isHidden,
    )
    .map((a) => ({ value: a.id, label: `${a.name} (${a.type})` }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!categoryId || !description || !amount || !assetAccountId) {
      setFormError("All fields are required");
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      setFormError("Amount must be greater than 0");
      return;
    }

    const selectedAsset = accounts.find((a) => a.id === assetAccountId);
    if (!selectedAsset || selectedAsset.isHidden) {
      setFormError("Select a valid asset account");
      return;
    }

    const incomeChild = accounts.find(
      (a) =>
        a.parentId === selectedAsset.id &&
        a.accounting === "income" &&
        !a.isHidden,
    );
    if (!incomeChild) {
      setFormError("No income child account found for selected asset");
      return;
    }

    const items = [
      { accountId: selectedAsset.id, debit: numAmount, credit: 0 },
      { accountId: incomeChild.id, debit: 0, credit: numAmount },
    ];

    const payload = {
      categoryId,
      description,
      date,
      items,
    };

    onSubmit(payload);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-5 max-w-xl mx-auto overflow-visible"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Combobox
          id="asset-account"
          label="Asset account"
          value={assetAccountId}
          onChange={setAssetAccountId}
          options={assetAccountOptions}
          placeholder="Select asset account"
        />
        <Combobox
          id="category"
          label="Category"
          value={categoryId}
          onChange={setCategoryId}
          options={categoryOptions}
          placeholder="Select category"
        />
      </div>

      <Input
        id="description"
        label="Description"
        placeholder="What was this income from?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <div className="grid gap-4 md:grid-cols-2">
        <DatePickerInput
          id="date"
          label="Date"
          value={date}
          onChange={(d) => setDate(d)}
          required
        />
        <Input
          id="amount"
          label="Amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      {(error || formError) && (
        <p className="text-sm text-rose-400">{error || formError}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          loading={loading}
        >
          {initial ? "Update" : "Add"} Income
        </Button>
      </div>
    </motion.form>
  );
}
