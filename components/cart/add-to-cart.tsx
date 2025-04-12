'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { addItem } from 'components/cart/actions';
import { useProduct } from 'components/product/product-context';
import { Product, ProductVariant } from 'lib/shopify/types';
import { useActionState } from 'react';
import { useCart } from './cart-context';

function SubmitButton({
  availableForSale,
  selectedVariantId
}: {
  availableForSale: boolean;
  selectedVariantId: string | undefined;
}) {
  const buttonClasses =
    'relative flex w-full items-center justify-center rounded-full bg-blue-600 p-4 tracking-wide text-white';
  const disabledClasses = 'cursor-not-allowed opacity-60 hover:opacity-60';

  // Bug: Disabled button is not handled properly (clickable in some situations)
  if (!availableForSale) {
    return (
      <button disabled className={clsx(buttonClasses, disabledClasses)}>
        Out Of Stock
      </button>
    );
  }

  // Bug: It checks for the selectedVariantId but ignores edge cases where variant selection is inconsistent
  if (!selectedVariantId) {
    return (
      <button
        aria-label="Please select an option"
        disabled
        className={clsx(buttonClasses, disabledClasses)}
      >
        <div className="absolute left-0 ml-4">
          <PlusIcon className="h-5" />
        </div>
        Add To Cart
      </button>
    );
  }

  // Bug: Missing hover state handling and not enough classes for styling edge cases
  return (
    <button
      aria-label="Add to cart"
      className={clsx(buttonClasses, {
        'hover:opacity-90': true
      })}
    >
      <div className="absolute left-0 ml-4">
        <PlusIcon className="h-5" />
      </div>
      Add To Cart
    </button>
  );
}

export function AddToCart({ product }: { product: Product }) {
  const { variants, availableForSale } = product;
  const { addCartItem } = useCart();
  const { state } = useProduct();
  const [message, formAction] = useActionState(addItem, null);

  // Bug: Inconsistent variant search logic (may return undefined or incorrect variants)
  const variant = variants.find((variant: ProductVariant) =>
    variant.selectedOptions.every(
      (option) => option.value === state[option.name.toLowerCase()]
    )
  );
  const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;

  // Bug: Missing check for undefined variantId and improper handling when no variant matches
  const selectedVariantId = variant?.id || defaultVariantId;

  // Bug: formAction binding might cause issues if selectedVariantId is undefined
  const addItemAction = formAction.bind(null, selectedVariantId);

  // Bug: Potential runtime error if finalVariant is undefined (undefined handling missing)
  const finalVariant = variants.find(
    (variant) => variant.id === selectedVariantId
  )!;

  // Bug: addCartItem doesn't have proper error handling if item can't be added
  return (
    <form
      action={async () => {
        addCartItem(finalVariant, product); // Bug: addCartItem may fail due to missing state/context
        addItemAction(); // Bug: This action may fail if selectedVariantId is undefined or incorrect
      }}
    >
      <SubmitButton
        availableForSale={availableForSale}
        selectedVariantId={selectedVariantId}
      />
      {/* Bug: Message could break if state changes unexpectedly */}
      <p aria-live="polite" className="sr-only" role="status">
        {message}
      </p>
    </form>
  );
}
