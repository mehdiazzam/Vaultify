import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import DatePickerInput from "../ui/DatePicker";
import { Combobox } from "../ui/Combobox";
import { useFinanceStore } from "../../stores/financeStore";
import type { SavingsGoal } from "../../types";

interface Props {
  onSubmit: (data: {
    title: string;
    description: string;
    amount: number;
    deadline: string;
    icon: string;
    color: string;
    currency: string;
  }) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}

const iconOptions = [
  { value: "Shield", label: "Shield" },
  { value: "Plane", label: "Plane" },
  { value: "Laptop", label: "Laptop" },
];

const DEFAULT_GOAL_COLOR = "#60a5fa";

export function SavingsGoalForm({ onSubmit, onCancel, loading, error }: Props) {
  const { currencies } = useFinanceStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [icon, setIcon] = useState<SavingsGoal["icon"]>("Shield");
  const [currency, setCurrency] = useState("USD");

  const currencyOptions = currencies.map((entry) => ({
    value: entry.iso,
    label: `${entry.iso} - ${entry.name}`,
  }));

  const selectedCurrency = currencies.some((entry) => entry.iso === currency)
    ? currency
    : (currencies[0]?.iso ?? "USD");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title || !amount || !deadline) return;

    onSubmit({
      title,
      description,
      amount: Number.parseFloat(amount),
      deadline,
      icon,
      color: DEFAULT_GOAL_COLOR,
      currency,
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4 overflow-visible"
    >
      <div className="grid md:grid-cols-2 gap-4">
        <Input
          id="goal-title"
          label="Goal title"
          placeholder="Emergency fund"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <Input
          id="goal-amount"
          label="Target amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
        />
      </div>
      <Input
        id="goal-description"
        label="Description"
        placeholder="Save for emergencies"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <div className="grid md:grid-cols-2 gap-4">
        <DatePickerInput
          id="goal-deadline"
          label="Deadline"
          value={deadline}
          onChange={(v) => setDeadline(v)}
          required
        />
        <Combobox
          id="goal-currency"
          label="Currency"
          value={selectedCurrency}
          onChange={setCurrency}
          options={
            currencyOptions.length > 0
              ? currencyOptions
              : [{ value: "USD", label: "USD - US Dollar" }]
          }
          placeholder="Select currency"
        />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
      <Combobox
        id="goal-icon"
        label="Icon"
        value={icon}
        onChange={(value) => setIcon(value as SavingsGoal["icon"])}
        options={iconOptions}
        placeholder="Select icon"
      />
      </div>
      {error && <p className="text-sm text-rose-400">{error}</p>}
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
          Create Goal
        </Button>
      </div>
    </motion.form>
  );
}
