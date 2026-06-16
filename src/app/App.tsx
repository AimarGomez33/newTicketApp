import { useState } from "react";
import {
  Minus, Plus, ShoppingBag, Trash2, ChevronLeft,
  UtensilsCrossed, Sandwich, Beef, Drumstick,
  Coffee, Fish, Flame, Cookie, Salad,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/* MARKER-MAKE-KIT-INVOKED */

type Dish = { id: number; name: string; description: string; price: number; category: string };
type OrderItem = { dish: Dish; qty: number };
type OrderSummaryProps = {
  mesa: string;
  order: OrderItem[];
  totalItems: number;
  totalPrice: number;
  adjust: (dish: Dish, delta: number) => void;
  onClose?: () => void;
  onClear: () => void;
};

const MENU: Dish[] = [
  { id: 1, name: "Quesadillas", description: "Quesadillas", price: 33, category: "Platillos" },
  { id: 2, name: "Tostadas", description: "Tostadas", price: 37, category: "Platillos" },
  { id: 3, name: "Chalupas", description: "Chalupas", price: 6, category: "Platillos" },
  { id: 4, name: "Volcanes", description: "Volcanes", price: 60, category: "Platillos" },
  { id: 5, name: "Volcan Queso/Guisado Extra", description: "Volcan Queso/Guisado Extra", price: 75, category: "Platillos" },
  { id: 6, name: "Pozole Grande", description: "Pozole Grande", price: 120, category: "Platillos" },
  { id: 7, name: "Pozole Chico", description: "Pozole Chico", price: 100, category: "Platillos" },
  { id: 8, name: "Alones", description: "Alones", price: 25, category: "Entradas" },
  { id: 9, name: "Mollejas", description: "Mollejas", price: 25, category: "Entradas" },
  { id: 10, name: "Higados", description: "Higados", price: 25, category: "Entradas" },
  { id: 11, name: "Patitas", description: "Patitas", price: 25, category: "Entradas" },
  { id: 12, name: "Huevos", description: "Huevos", price: 20, category: "Entradas" },
  { id: 13, name: "Pambazos Naturales", description: "Pambazos Naturales", price: 38, category: "Pambazos" },
  { id: 14, name: "Pambazos Naturales Combinados", description: "Pambazos Naturales Combinados", price: 45, category: "Pambazos" },
  { id: 15, name: "Pambazos Naturales Combinados con Queso", description: "Pambazos Naturales Combinados con Queso", price: 60, category: "Pambazos" },
  { id: 16, name: "Pambazos Naturales Extra", description: "Pambazos Naturales Extra", price: 53, category: "Pambazos" },
  { id: 17, name: "Pambazos Adobados", description: "Pambazos Adobados", price: 43, category: "Pambazos" },
  { id: 18, name: "Pambazos Adobados Combinados", description: "Pambazos Adobados Combinados", price: 50, category: "Pambazos" },
  { id: 19, name: "Pambazos Adobados Combinados con Queso", description: "Pambazos Adobados Combinados con Queso", price: 59, category: "Pambazos" },
  { id: 20, name: "Pambazos Adobados Extra", description: "Pambazos Adobados Extra", price: 58, category: "Pambazos" },
  { id: 21, name: "Guajoloyets Naturales", description: "Guajoloyets Naturales", price: 65, category: "Guajoloyets" },
  { id: 22, name: "Guajoloyets Naturales Extra", description: "Guajoloyets Naturales Extra", price: 80, category: "Guajoloyets" },
  { id: 23, name: "Guajoloyets Adobados", description: "Guajoloyets Adobados", price: 70, category: "Guajoloyets" },
  { id: 24, name: "Guajoloyets Adobados Extra", description: "Guajoloyets Adobados Extra", price: 85, category: "Guajoloyets" },
  { id: 25, name: "Orden de Papas Sencillas", description: "Orden de Papas Sencillas", price: 60, category: "Papas" },
  { id: 26, name: "Orden de Papas Boneless", description: "Orden de Papas Boneless", price: 130, category: "Papas" },
  { id: 27, name: "Orden de Papas y aros de cebolla", description: "Orden de Papas y aros de cebolla", price: 110, category: "Papas" },
  { id: 28, name: "Taco (c/u)", description: "Taco (c/u)", price: 35, category: "Tacos" },
  { id: 29, name: "Taco con Queso (c/u)", description: "Taco con Queso (c/u)", price: 47, category: "Tacos" },
  { id: 30, name: "Alitas 6 pzas", description: "Alitas 6 pzas", price: 80, category: "Alitas" },
  { id: 31, name: "Alitas 6 pzas", description: "Alitas 6 pzas", price: 110, category: "Alitas" },
  { id: 32, name: "Alitas 12 pzas", description: "Alitas 12 pzas", price: 140, category: "Alitas" },
  { id: 33, name: "Alitas 12 pzas con papas", description: "Alitas 12 pzas con papas", price: 170, category: "Alitas" },
  { id: 34, name: "Refrescos", description: "Refrescos", price: 28, category: "Bebidas" },
  { id: 35, name: "Cafe", description: "Cafe", price: 24, category: "Bebidas" },
  { id: 36, name: "Aguas de Sabor", description: "Aguas de Sabor", price: 26, category: "Bebidas" },
  { id: 37, name: "Agua Natural", description: "Agua Natural", price: 24, category: "Bebidas" },
  { id: 38, name: "Hamburguesa americana", description: "Hamburguesa americana", price: 60, category: "Hamburguesas" },
  { id: 39, name: "Hamburguesa especial", description: "Hamburguesa especial", price: 90, category: "Hamburguesas" },
  { id: 40, name: "Hamburguesa Pollo bbq", description: "Hamburguesa Pollo bbq", price: 105, category: "Hamburguesas" },
  { id: 41, name: "Hamburguesa texana", description: "Hamburguesa texana", price: 110, category: "Hamburguesas" },
  { id: 42, name: "Hamburguesa suiza", description: "Hamburguesa suiza", price: 90, category: "Hamburguesas" },
];

const CATEGORIES = [
  { id: "Platillos",     label: "Platillos",    Icon: UtensilsCrossed },
  { id: "Entradas",      label: "Entradas",     Icon: Salad },
  { id: "Pambazos",      label: "Pambazos",     Icon: Sandwich },
  { id: "Guajoloyets",   label: "Guajoloyets",  Icon: Fish },
  { id: "Papas",         label: "Papas",        Icon: Flame },
  { id: "Tacos",         label: "Tacos",        Icon: Cookie },
  { id: "Alitas",        label: "Alitas",       Icon: Drumstick },
  { id: "Bebidas",       label: "Bebidas",      Icon: Coffee },
  { id: "Postres",       label: "Postres",      Icon: Cookie },
  { id: "Hamburguesas",  label: "Hamburguesas", Icon: Beef },
];

function OrderSummary({
  mesa,
  order,
  totalItems,
  totalPrice,
  adjust,
  onClose,
  onClear,
}: OrderSummaryProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex justify-center pt-3 pb-1 shrink-0">
        <div className="w-8 h-0.5 rounded-full" style={{ background: "var(--border)" }} />
      </div>

      <div
        className="flex shrink-0 items-center gap-3 px-4 py-3 sm:px-5 lg:px-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {onClose && (
          <button
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
            style={{ color: "var(--muted-foreground)", background: "var(--secondary)" }}
            aria-label="Cerrar resumen"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        <span
          className="min-w-0 flex-1 text-sm font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          Resumen de orden
        </span>
        {mesa && (
          <span
            className="max-w-32 truncate rounded-md px-2 py-1 text-xs font-medium sm:max-w-44"
            style={{ background: "var(--secondary)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
            title={`Mesa ${mesa}`}
          >
            Mesa {mesa}
          </span>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto divide-y" style={{ borderColor: "var(--border)" }}>
        {order.length === 0 ? (
          <p className="px-5 pt-10 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
            No hay artículos en la orden.
          </p>
        ) : (
          order.map((item) => (
            <div key={item.dish.id} className="flex items-center gap-3 px-4 py-3 sm:px-5 lg:px-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  {item.dish.name}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  ${item.dish.price} c/u
                </p>
              </div>
              <div
                className="flex shrink-0 items-center gap-0.5 rounded-lg p-0.5"
                style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}
              >
                <button
                  onClick={() => adjust(item.dish, -1)}
                  className="flex h-7 w-7 items-center justify-center rounded-md"
                  style={{ background: "var(--muted)", color: "var(--foreground)" }}
                  aria-label={`Quitar ${item.dish.name}`}
                >
                  <Minus size={12} />
                </button>
                <span className="w-7 text-center text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                  {item.qty}
                </span>
                <button
                  onClick={() => adjust(item.dish, 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-md"
                  style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                  aria-label={`Agregar ${item.dish.name}`}
                >
                  <Plus size={12} />
                </button>
              </div>
              <span className="w-16 shrink-0 text-right text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                ${(item.qty * item.dish.price).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>

      {order.length > 0 && (
        <div
          className="shrink-0 px-4 py-4 sm:px-5 lg:px-4"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
              Total - {totalItems} artículo{totalItems !== 1 ? "s" : ""}
            </span>
            <span className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
              ${totalPrice.toLocaleString()}
            </span>
          </div>
          <button
            className="mt-3 w-full rounded-lg py-3 text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            Enviar Comanda
          </button>
          <button
            onClick={onClear}
            className="mt-2 flex w-full items-center justify-center gap-1.5 py-1 text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            <Trash2 size={11} />
            Limpiar orden
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [mesa, setMesa] = useState("");
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [showOrder, setShowOrder] = useState(false);

  const dishes = MENU.filter((d) => d.category === activeCategory);
  const getQty = (id: number) => order.find((o) => o.dish.id === id)?.qty ?? 0;

  const adjust = (dish: Dish, delta: number) => {
    setOrder((prev) => {
      const existing = prev.find((o) => o.dish.id === dish.id);
      if (!existing) return delta < 1 ? prev : [...prev, { dish, qty: 1 }];
      const newQty = existing.qty + delta;
      if (newQty <= 0) return prev.filter((o) => o.dish.id !== dish.id);
      return prev.map((o) => (o.dish.id === dish.id ? { ...o, qty: newQty } : o));
    });
  };

  const totalItems = order.reduce((s, o) => s + o.qty, 0);
  const totalPrice = order.reduce((s, o) => s + o.qty * o.dish.price, 0);

  return (
    <div
      className="box-border size-full overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif", background: "var(--background)", color: "var(--foreground)" }}
    >
      <div
        className="box-border flex size-full flex-col overflow-hidden"
        style={{ background: "var(--background)", border: "1px solid var(--border)" }}
      >
        {/* ── HEADER — Mesa siempre visible ── */}
        <header
          className="flex shrink-0 items-center gap-2 px-2.5 py-1.5"
          style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}
        >
          <div
            className="flex min-h-12 flex-1 items-center gap-2 rounded-xl px-4"
            style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}
          >
            <span className="shrink-0 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
              Mesa
            </span>
            <div style={{ width: "1px", height: "14px", background: "var(--border)" }} />
            <input
              type="text"
              value={mesa}
              onChange={(e) => setMesa(e.target.value)}
              placeholder="Número o nombre"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--foreground)", caretColor: "var(--primary)" }}
            />
            {mesa && (
              <button
                onClick={() => setMesa("")}
                className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-xs"
                style={{ color: "var(--muted-foreground)" }}
                aria-label="Borrar mesa"
              >
                x
              </button>
            )}
          </div>

          <button
            onClick={() => setShowOrder(true)}
            className="relative flex min-h-12 shrink-0 items-center gap-2 rounded-xl px-4 transition-all hover:opacity-90"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <ShoppingBag size={15} />
            <span className="text-sm font-semibold">
              {totalItems > 0 ? `$${totalPrice.toLocaleString()}` : "Orden"}
            </span>
            {totalItems > 0 && (
              <motion.span
                key={totalItems}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full font-bold"
                style={{ background: "var(--accent)", color: "var(--foreground)", fontSize: "10px" }}
              >
                {totalItems}
              </motion.span>
            )}
          </button>
        </header>

        {/* ── BODY ── */}
        <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* ── SIDEBAR DE CATEGORÍAS ── */}
        <nav
          className="flex w-20 shrink-0 flex-col gap-0.5 overflow-y-auto px-1 py-2"
          style={{ background: "var(--card)", borderRight: "1px solid var(--border)" }}
        >
          {CATEGORIES.map(({ id, label, Icon }) => {
            const isActive = id === activeCategory;
            const count = order.filter((o) => o.dish.category === id).reduce((s, o) => s + o.qty, 0);

            return (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className="relative flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-lg py-3 transition-all"
                style={{
                  background: isActive ? "var(--primary)" : "transparent",
                }}
              >
                <Icon
                  size={18}
                  style={{ color: isActive ? "var(--primary-foreground)" : "var(--muted-foreground)" }}
                  strokeWidth={isActive ? 2.2 : 1.6}
                />
                <span
                  style={{
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? "var(--primary-foreground)" : "var(--muted-foreground)",
                    letterSpacing: 0,
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}
                  className="max-w-[64px] text-[10px]"
                >
                  {label}
                </span>
                {count > 0 && (
                  <span
                    className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full"
                    style={{
                      background: isActive ? "var(--primary-foreground)" : "var(--accent)",
                      color: isActive ? "var(--primary)" : "var(--foreground)",
                      fontSize: "8px",
                      fontWeight: 700,
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ── PLATILLOS ── */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
              className="flex flex-col"
            >
              {/* Encabezado de sección */}
              <div
                className="sticky top-0 z-10 flex items-center gap-2 px-6 py-3.5"
                style={{ background: "var(--background)", borderBottom: "1px solid var(--border)" }}
              >
                {(() => {
                  const cat = CATEGORIES.find((c) => c.id === activeCategory)!;
                  return (
                    <>
                      <cat.Icon size={14} style={{ color: "var(--muted-foreground)" }} strokeWidth={1.8} />
                      <span
                        className="text-xs font-semibold uppercase tracking-widest"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {cat.label}
                      </span>
                    </>
                  );
                })()}
              </div>

              <div className="flex flex-col divide-y" style={{ borderColor: "var(--border)" }}>
                {dishes.map((dish) => {
                  const qty = getQty(dish.id);
                  return (
                    <div
                      key={dish.id}
                      className="flex min-h-[108px] items-center gap-4 px-6 py-4 transition-all"
                      style={{
                        background: qty > 0 ? "var(--card)" : "transparent",
                        borderLeft: qty > 0 ? "2px solid var(--primary)" : "2px solid transparent",
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug" style={{ color: "var(--foreground)" }}>
                          {dish.name}
                        </p>
                        <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--muted-foreground)" }}>
                          {dish.description}
                        </p>
                        <p
                          className="text-sm font-semibold mt-1"
                          style={{ color: qty > 0 ? "var(--primary)" : "var(--foreground)" }}
                        >
                          ${dish.price}
                        </p>
                      </div>

                      {qty === 0 ? (
                        <button
                          onClick={() => adjust(dish, 1)}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all hover:opacity-80"
                          style={{ background: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)" }}
                        >
                          <Plus size={14} />
                        </button>
                      ) : (
                        <div
                          className="flex shrink-0 items-center gap-0.5 rounded-lg p-0.5"
                          style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}
                        >
                          <button
                            onClick={() => adjust(dish, -1)}
                            className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:opacity-80"
                            style={{ background: "var(--muted)", color: "var(--foreground)" }}
                          >
                            <Minus size={12} />
                          </button>
                          <span
                            className="w-7 text-center text-sm font-semibold"
                            style={{ color: "var(--foreground)" }}
                          >
                            {qty}
                          </span>
                          <button
                            onClick={() => adjust(dish, 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:opacity-80"
                            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      </div>

      {/* ── ORDER DRAWER ── */}
      <AnimatePresence>
        {showOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.55)" }}
              onClick={() => setShowOrder(false)}
            />
            <motion.aside
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-w-3xl flex-col rounded-t-2xl"
              style={{ background: "var(--card)", maxHeight: "88vh", borderTop: "1px solid var(--border)" }}
            >
              <OrderSummary
                mesa={mesa}
                order={order}
                totalItems={totalItems}
                totalPrice={totalPrice}
                adjust={adjust}
                onClose={() => setShowOrder(false)}
                onClear={() => setOrder([])}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
