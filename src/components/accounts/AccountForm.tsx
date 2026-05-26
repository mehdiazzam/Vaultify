import { useState, type FormEvent } from "react";
import { Wallet } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Combobox } from "../ui/Combobox";
import { useFinanceStore } from "../../stores/financeStore";
import { useFinanceData } from "../../hooks/useFinanceData";
import type { AccountType } from "../../types";

const accountTypeOptions: { value: AccountType; label: string }[] = [
  { value: "bank", label: "Bank" },
  { value: "cash", label: "Cash" },
  { value: "e-wallet", label: "E-Wallet" },
];

interface Props {
  onSuccess?: () => void;
}

export default function AccountForm({ onSuccess }: Props) {
  const { currencies } = useFinanceStore();
  const { createAccount } = useFinanceData();
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("bank");
  const [currency, setCurrency] = useState("USD");
  const [number, setNumber] = useState("");
  const [formError, setFormError] = useState("");

  const currencyOptions = currencies.map((entry) => ({
    value: entry.iso,
    label: `${entry.iso} - ${entry.name}`,
    icon: entry.icon ? <span className="text-sm">{entry.icon}</span> : undefined,
  }));
  const selectedCurrency = currencies.some((entry) => entry.iso === currency) ? currency : (currencies[0]?.iso ?? 'USD');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    if (!name.trim()) {
      setFormError("Account name is required.");
      return;
    }

    try {
      await createAccount.mutateAsync({
        name,
        type,
        currency: selectedCurrency,
        isSaving: false,
        number: number.trim() || undefined,
      });

      setName("");
      setType("bank");
      setCurrency("USD");
      setNumber("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not create account.",
      );
    }
  };

  return (
    <>
      {formError && <p className="text-sm text-rose-400">{formError}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="account-name"
          label="Account name"
          placeholder="Main Bank Account"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <div className="grid md:grid-cols-2 gap-4">
          <Combobox
            id="account-type"
            label="Account type"
            value={type}
            onChange={(value) => setType(value as AccountType)}
            options={accountTypeOptions}
            placeholder="Select account type"
          />
          <Combobox 
            id="account-currency"
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
        <Input
          id="account-number"
          label="Account number"
          placeholder="Optional"
          value={number}
          onChange={(event) => setNumber(event.target.value)}
        />
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            loading={createAccount.isPending}
            icon={<Wallet size={16} />}
          >
            Create Account
          </Button>
        </div>
      </form>
    </>
  );
}
