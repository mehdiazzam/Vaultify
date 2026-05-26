import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import type { Category, Currency } from '../../types';
import { requireDb, mapDoc } from './helpers';
import { CATEGORIES, ALL_DEFAULT_CATEGORIES, DEFAULT_CURRENCIES, CURRENCIES } from './constants';

export const getCategories = async (): Promise<Category[]> => {
  const firestore = requireDb();
  const categoriesCollection = collection(firestore, CATEGORIES);
  const snap = await getDocs(categoriesCollection);

  const categories = snap.docs.map((snapshotDoc) => mapDoc<Category>(snapshotDoc));

  if (categories.length === 0) {
    await Promise.all(
      ALL_DEFAULT_CATEGORIES.map((category) => setDoc(doc(firestore, CATEGORIES, category.id), category))
    );

    return ALL_DEFAULT_CATEGORIES.sort((a, b) => a.name.localeCompare(b.name));
  }

  const missingCategories = ALL_DEFAULT_CATEGORIES.filter(
    (defaultCategory) => !categories.some((category) => category.id === defaultCategory.id)
  );

  if (missingCategories.length > 0) {
    await Promise.all(
      missingCategories.map((category) => setDoc(doc(firestore, CATEGORIES, category.id), category))
    );

    return [...categories, ...missingCategories].sort((a, b) => a.name.localeCompare(b.name));
  }

  // Backfill category metadata
  const defaultsById = new Map(ALL_DEFAULT_CATEGORIES.map((category) => [category.id, category]));
  const categoriesNeedingPatch = categories.filter((category) => {
    const defaultCategory = defaultsById.get(category.id);
    return !!defaultCategory && (!category.color || !category.icon || !category.type);
  });

  if (categoriesNeedingPatch.length > 0) {
    await Promise.all(
      categoriesNeedingPatch.map((category) => {
        const defaultCategory = defaultsById.get(category.id);
        if (!defaultCategory) return Promise.resolve();

        return setDoc(
          doc(firestore, CATEGORIES, category.id),
          {
            type: defaultCategory.type,
            color: defaultCategory.color,
            icon: defaultCategory.icon,
          },
          { merge: true }
        );
      })
    );

    return categories.map((category) => {
      const defaultCategory = defaultsById.get(category.id);
      if (!defaultCategory) return category;

      return {
        ...category,
        type: category.type || defaultCategory.type,
        color: category.color || defaultCategory.color,
        icon: category.icon || defaultCategory.icon,
      };
    });
  }

  return categories;
};

export const getCurrencies = async (): Promise<Currency[]> => {
  const firestore = requireDb();
  const currenciesCollection = collection(firestore, CURRENCIES);
  const snap = await getDocs(currenciesCollection);

  const currencies = snap.docs.map((snapshotDoc) => mapDoc<Currency>(snapshotDoc));

  if (currencies.length === 0) {
    await Promise.all(
      DEFAULT_CURRENCIES.map((currency) => setDoc(doc(firestore, CURRENCIES, currency.id), currency))
    );

    return [...DEFAULT_CURRENCIES].sort((a, b) => a.iso.localeCompare(b.iso));
  }

  const missingCurrencies = DEFAULT_CURRENCIES.filter(
    (defaultCurrency) => !currencies.some((currency) => currency.id === defaultCurrency.id)
  );

  if (missingCurrencies.length > 0) {
    await Promise.all(
      missingCurrencies.map((currency) => setDoc(doc(firestore, CURRENCIES, currency.id), currency))
    );
  }

  return [...currencies, ...missingCurrencies].sort((a, b) => a.iso.localeCompare(b.iso));
};
