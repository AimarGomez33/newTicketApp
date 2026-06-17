import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { printDirect } from '../utils/printer';

type Dish = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
};

type OrderItem = {
  dish: Dish;
  qty: number;
};

type Category = {
  id: string;
  label: string;
  mark: string;
};

const MENU: Dish[] = [
  { id: 1, name: 'Quesadillas', description: 'Quesadillas', price: 33, category: 'Platillos' },
  { id: 2, name: 'Tostadas', description: 'Tostadas', price: 37, category: 'Platillos' },
  { id: 3, name: 'Chalupas', description: 'Chalupas', price: 6, category: 'Platillos' },
  { id: 4, name: 'Volcanes', description: 'Volcanes', price: 60, category: 'Platillos' },
  { id: 5, name: 'Volcan Queso/Guisado Extra', description: 'Volcan Queso/Guisado Extra', price: 75, category: 'Platillos' },
  { id: 6, name: 'Pozole Grande', description: 'Pozole Grande', price: 120, category: 'Platillos' },
  { id: 7, name: 'Pozole Chico', description: 'Pozole Chico', price: 100, category: 'Platillos' },
  { id: 8, name: 'Alones', description: 'Alones', price: 25, category: 'Entradas' },
  { id: 9, name: 'Mollejas', description: 'Mollejas', price: 25, category: 'Entradas' },
  { id: 10, name: 'Higados', description: 'Higados', price: 25, category: 'Entradas' },
  { id: 11, name: 'Patitas', description: 'Patitas', price: 25, category: 'Entradas' },
  { id: 12, name: 'Huevos', description: 'Huevos', price: 20, category: 'Entradas' },
  { id: 13, name: 'Pambazos Naturales', description: 'Pambazos Naturales', price: 38, category: 'Pambazos' },
  { id: 14, name: 'Pambazos Naturales Combinados', description: 'Pambazos Naturales Combinados', price: 45, category: 'Pambazos' },
  { id: 15, name: 'Pambazos Naturales Combinados con Queso', description: 'Pambazos Naturales Combinados con Queso', price: 60, category: 'Pambazos' },
  { id: 16, name: 'Pambazos Naturales Extra', description: 'Pambazos Naturales Extra', price: 53, category: 'Pambazos' },
  { id: 17, name: 'Pambazos Adobados', description: 'Pambazos Adobados', price: 43, category: 'Pambazos' },
  { id: 18, name: 'Pambazos Adobados Combinados', description: 'Pambazos Adobados Combinados', price: 50, category: 'Pambazos' },
  { id: 19, name: 'Pambazos Adobados Combinados con Queso', description: 'Pambazos Adobados Combinados con Queso', price: 59, category: 'Pambazos' },
  { id: 20, name: 'Pambazos Adobados Extra', description: 'Pambazos Adobados Extra', price: 58, category: 'Pambazos' },
  { id: 21, name: 'Guajoloyets Naturales', description: 'Guajoloyets Naturales', price: 65, category: 'Guajoloyets' },
  { id: 22, name: 'Guajoloyets Naturales Extra', description: 'Guajoloyets Naturales Extra', price: 80, category: 'Guajoloyets' },
  { id: 23, name: 'Guajoloyets Adobados', description: 'Guajoloyets Adobados', price: 70, category: 'Guajoloyets' },
  { id: 24, name: 'Guajoloyets Adobados Extra', description: 'Guajoloyets Adobados Extra', price: 85, category: 'Guajoloyets' },
  { id: 25, name: 'Orden de Papas Sencillas', description: 'Orden de Papas Sencillas', price: 60, category: 'Papas' },
  { id: 26, name: 'Orden de Papas Boneless', description: 'Orden de Papas Boneless', price: 130, category: 'Papas' },
  { id: 27, name: 'Orden de Papas y aros de cebolla', description: 'Orden de Papas y aros de cebolla', price: 110, category: 'Papas' },
  { id: 28, name: 'Taco (c/u)', description: 'Taco (c/u)', price: 35, category: 'Tacos' },
  { id: 29, name: 'Taco con Queso (c/u)', description: 'Taco con Queso (c/u)', price: 47, category: 'Tacos' },
  { id: 30, name: 'Alitas 6 pzas', description: 'Alitas 6 pzas', price: 80, category: 'Alitas' },
  { id: 31, name: 'Alitas 6 pzas', description: 'Alitas 6 pzas', price: 110, category: 'Alitas' },
  { id: 32, name: 'Alitas 12 pzas', description: 'Alitas 12 pzas', price: 140, category: 'Alitas' },
  { id: 33, name: 'Alitas 12 pzas con papas', description: 'Alitas 12 pzas con papas', price: 170, category: 'Alitas' },
  { id: 34, name: 'Refrescos', description: 'Refrescos', price: 28, category: 'Bebidas' },
  { id: 35, name: 'Cafe', description: 'Cafe', price: 24, category: 'Bebidas' },
  { id: 36, name: 'Aguas de Sabor', description: 'Aguas de Sabor', price: 26, category: 'Bebidas' },
  { id: 37, name: 'Agua Natural', description: 'Agua Natural', price: 24, category: 'Bebidas' },
  { id: 38, name: 'Hamburguesa americana', description: 'Hamburguesa americana', price: 60, category: 'Hamburguesas' },
  { id: 39, name: 'Hamburguesa especial', description: 'Hamburguesa especial', price: 90, category: 'Hamburguesas' },
  { id: 40, name: 'Hamburguesa Pollo bbq', description: 'Hamburguesa Pollo bbq', price: 105, category: 'Hamburguesas' },
  { id: 41, name: 'Hamburguesa texana', description: 'Hamburguesa texana', price: 110, category: 'Hamburguesas' },
  { id: 42, name: 'Hamburguesa suiza', description: 'Hamburguesa suiza', price: 90, category: 'Hamburguesas' },
];

const CATEGORIES: Category[] = [
  { id: 'Platillos', label: 'Platillos', mark: 'PL' },
  { id: 'Entradas', label: 'Entradas', mark: 'EN' },
  { id: 'Pambazos', label: 'Pambazos', mark: 'PA' },
  { id: 'Guajoloyets', label: 'Guajoloyets', mark: 'GU' },
  { id: 'Papas', label: 'Papas', mark: 'PP' },
  { id: 'Tacos', label: 'Tacos', mark: 'TA' },
  { id: 'Alitas', label: 'Alitas', mark: 'AL' },
  { id: 'Bebidas', label: 'Bebidas', mark: 'BE' },
  { id: 'Postres', label: 'Postres', mark: 'PO' },
  { id: 'Hamburguesas', label: 'Hamburguesas', mark: 'HA' },
];

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 840;
  const [mesa, setMesa] = useState('');
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [showOrder, setShowOrder] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const dishes = MENU.filter((dish) => dish.category === activeCategory);
  const active = CATEGORIES.find((category) => category.id === activeCategory) ?? CATEGORIES[0];
  const totalItems = order.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = order.reduce((sum, item) => sum + item.qty * item.dish.price, 0);
  const getQty = (id: number) => order.find((item) => item.dish.id === id)?.qty ?? 0;

  const adjust = (dish: Dish, delta: number) => {
    setOrder((prev) => {
      const existing = prev.find((item) => item.dish.id === dish.id);
      if (!existing) {
        return delta > 0 ? [...prev, { dish, qty: 1 }] : prev;
      }

      const qty = existing.qty + delta;
      if (qty <= 0) {
        return prev.filter((item) => item.dish.id !== dish.id);
      }

      return prev.map((item) => (item.dish.id === dish.id ? { ...item, qty } : item));
    });
  };


  const printTicket = async () => {
    if (order.length === 0 || isPrinting) {
      return;
    }

    setIsPrinting(true);
    const orderData = {
      mesa,
      createdAt: new Date(),
      items: order.map((item) => ({
        name: item.dish.name,
        price: item.dish.price,
        qty: item.qty,
        total: item.qty * item.dish.price,
      })),
      totalItems,
      totalPrice,
    };

    try {
      await printDirect(orderData);
      Alert.alert('Exito', 'Ticket enviado directamente a la impresora.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido al imprimir.';
      Alert.alert('Error de impresion', message);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.shell}>
        <View style={styles.header}>
          <View style={styles.tableInputWrap}>
            <Text style={styles.tableLabel}>MESA</Text>
            <View style={styles.separator} />
            <TextInput
              value={mesa}
              onChangeText={setMesa}
              placeholder="Numero o nombre"
              placeholderTextColor="#8f93a1"
              style={styles.tableInput}
            />
          </View>

          <Pressable
            style={[styles.orderButton, isTablet && styles.orderButtonTablet]}
            onPress={() => !isTablet && setShowOrder(true)}>
            <Text style={styles.orderButtonText}>
              {totalItems > 0 ? `$${totalPrice.toLocaleString()}` : 'Orden'}
            </Text>
            {totalItems > 0 && <Text style={styles.orderBadge}>{totalItems}</Text>}
          </Pressable>
        </View>

        <View style={styles.body}>
          <ScrollView style={styles.sidebar} contentContainerStyle={styles.sidebarContent}>
            {CATEGORIES.map((category) => {
              const selected = category.id === activeCategory;
              const count = order
                .filter((item) => item.dish.category === category.id)
                .reduce((sum, item) => sum + item.qty, 0);

              return (
                <Pressable
                  key={category.id}
                  onPress={() => setActiveCategory(category.id)}
                  style={[styles.categoryButton, selected && styles.categoryButtonActive]}>
                  <Text style={[styles.categoryIcon, selected && styles.categoryIconActive]}>
                    {category.mark}
                  </Text>
                  <Text style={[styles.categoryLabel, selected && styles.categoryLabelActive]}>
                    {category.label}
                  </Text>
                  {count > 0 && <Text style={styles.categoryBadge}>{count}</Text>}
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.menuArea}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>{active.mark}</Text>
              <Text style={styles.sectionTitle}>{active.label}</Text>
            </View>

            <ScrollView style={styles.menuList}>
              {dishes.length === 0 ? (
                <Text style={styles.emptyCategoryText}>No hay productos en esta categoria.</Text>
              ) : dishes.map((dish) => {
                const qty = getQty(dish.id);

                return (
                  <View key={dish.id} style={[styles.dishRow, qty > 0 && styles.dishRowSelected]}>
                    <View style={styles.dishCopy}>
                      <Text style={styles.dishName}>{dish.name}</Text>
                      <Text style={styles.dishDescription}>{dish.description}</Text>
                      <Text style={styles.dishPrice}>${dish.price}</Text>
                    </View>

                    {qty === 0 ? (
                      <Pressable style={styles.addButton} onPress={() => adjust(dish, 1)}>
                        <Text style={styles.addButtonText}>+</Text>
                      </Pressable>
                    ) : (
                      <View style={styles.qtyControl}>
                        <Pressable style={styles.qtyButtonMuted} onPress={() => adjust(dish, -1)}>
                          <Text style={styles.qtyButtonText}>-</Text>
                        </Pressable>
                        <Text style={styles.qtyText}>{qty}</Text>
                        <Pressable style={styles.qtyButtonDark} onPress={() => adjust(dish, 1)}>
                          <Text style={styles.qtyButtonTextDark}>+</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>

          {isTablet && (
            <View style={styles.tabletOrderPanel}>
              <View style={styles.panelHeader}>
                <View>
                  <Text style={styles.panelEyebrow}>ORDEN</Text>
                  <Text style={styles.panelTitle}>Resumen</Text>
                </View>
                {mesa ? <Text style={styles.tableChip}>Mesa {mesa}</Text> : null}
              </View>

              <ScrollView style={styles.panelList}>
                {order.length === 0 ? (
                  <Text style={styles.panelEmpty}>No hay articulos en la orden.</Text>
                ) : (
                  order.map((item) => (
                    <View key={item.dish.id} style={styles.panelOrderRow}>
                      <View style={styles.dishCopy}>
                        <Text style={styles.orderName}>{item.dish.name}</Text>
                        <Text style={styles.dishDescription}>${item.dish.price} c/u</Text>
                      </View>
                      <View style={styles.qtyControlCompact}>
                        <Pressable style={styles.qtyButtonMuted} onPress={() => adjust(item.dish, -1)}>
                          <Text style={styles.qtyButtonText}>-</Text>
                        </Pressable>
                        <Text style={styles.qtyText}>{item.qty}</Text>
                        <Pressable style={styles.qtyButtonDark} onPress={() => adjust(item.dish, 1)}>
                          <Text style={styles.qtyButtonTextDark}>+</Text>
                        </Pressable>
                      </View>
                      <Text style={styles.orderTotal}>${(item.qty * item.dish.price).toLocaleString()}</Text>
                    </View>
                  ))
                )}
              </ScrollView>

              {order.length > 0 && (
                <View style={styles.panelFooter}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total - {totalItems} articulo{totalItems !== 1 ? 's' : ''}</Text>
                    <Text style={styles.totalPrice}>${totalPrice.toLocaleString()}</Text>
                  </View>
                  <Pressable
                    disabled={isPrinting}
                    onPress={printTicket}
                    style={[styles.sendButton, isPrinting && styles.sendButtonDisabled]}>
                    <Text style={styles.sendButtonText}>
                      {isPrinting ? 'Imprimiendo...' : 'Enviar Comanda'}
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => setOrder([])}>
                    <Text style={styles.clearButton}>Limpiar orden</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}
        </View>

        <Pressable style={styles.helpButton}>
          <Text style={styles.helpText}>?</Text>
        </Pressable>
      </View>

      <Modal visible={!isTablet && showOrder} transparent animationType="slide" onRequestClose={() => setShowOrder(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowOrder(false)} />
        <View style={styles.orderSheet}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <Pressable style={styles.closeButton} onPress={() => setShowOrder(false)}>
              <Text style={styles.closeText}>{'<'}</Text>
            </Pressable>
            <Text style={styles.sheetTitle}>Resumen de orden</Text>
            {mesa ? <Text style={styles.tableChip}>Mesa {mesa}</Text> : null}
          </View>

          <ScrollView style={styles.sheetList}>
            {order.length === 0 ? (
              <Text style={styles.emptyText}>No hay articulos en la orden.</Text>
            ) : (
              order.map((item) => (
                <View key={item.dish.id} style={styles.orderRow}>
                  <View style={styles.dishCopy}>
                    <Text style={styles.orderName}>{item.dish.name}</Text>
                    <Text style={styles.dishDescription}>${item.dish.price} c/u</Text>
                  </View>
                  <View style={styles.qtyControlCompact}>
                    <Pressable style={styles.qtyButtonMuted} onPress={() => adjust(item.dish, -1)}>
                      <Text style={styles.qtyButtonText}>-</Text>
                    </Pressable>
                    <Text style={styles.qtyText}>{item.qty}</Text>
                    <Pressable style={styles.qtyButtonDark} onPress={() => adjust(item.dish, 1)}>
                      <Text style={styles.qtyButtonTextDark}>+</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.orderTotal}>${(item.qty * item.dish.price).toLocaleString()}</Text>
                </View>
              ))
            )}
          </ScrollView>

          {order.length > 0 && (
            <View style={styles.sheetFooter}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total - {totalItems} articulo{totalItems !== 1 ? 's' : ''}</Text>
                <Text style={styles.totalPrice}>${totalPrice.toLocaleString()}</Text>
              </View>
              <Pressable
                disabled={isPrinting}
                onPress={printTicket}
                style={[styles.sendButton, isPrinting && styles.sendButtonDisabled]}>
                <Text style={styles.sendButtonText}>
                  {isPrinting ? 'Imprimiendo...' : 'Enviar Comanda'}
                </Text>
              </Pressable>
              <Pressable onPress={() => setOrder([])}>
                <Text style={styles.clearButton}>Limpiar orden</Text>
              </Pressable>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const colors = {
  background: '#ffffff',
  card: '#ffffff',
  primary: '#030213',
  muted: '#f0f1f5',
  border: '#e4e5eb',
  text: '#25262b',
  secondaryText: '#8f93a1',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  shell: {
    flex: 1,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.background,
  },
  header: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  tableInputWrap: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d7d9e2',
    backgroundColor: '#eef0f5',
    paddingHorizontal: 16,
  },
  tableLabel: {
    color: colors.secondaryText,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  separator: {
    width: 1,
    height: 22,
    backgroundColor: '#d4d7df',
  },
  tableInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  orderButton: {
    minHeight: 48,
    minWidth: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
  },
  orderButtonTablet: {
    opacity: 0.96,
  },
  orderButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  orderBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
    backgroundColor: colors.muted,
    color: colors.primary,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '900',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 0,
  },
  sidebar: {
    width: 88,
    flexGrow: 0,
    borderRightColor: colors.border,
    borderRightWidth: 1,
    backgroundColor: colors.card,
  },
  sidebarContent: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  categoryButton: {
    position: 'relative',
    minHeight: 78,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
  },
  categoryIcon: {
    minWidth: 30,
    height: 24,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.muted,
    color: colors.secondaryText,
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 24,
    textAlign: 'center',
  },
  categoryIconActive: {
    backgroundColor: '#ffffff',
    color: colors.primary,
  },
  categoryLabel: {
    color: colors.secondaryText,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: '#ffffff',
    fontWeight: '900',
  },
  categoryBadge: {
    position: 'absolute',
    top: 4,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.muted,
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  menuArea: {
    flex: 1,
    minWidth: 0,
  },
  sectionHeader: {
    minHeight: 47,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 22,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    backgroundColor: colors.background,
  },
  sectionIcon: {
    minWidth: 30,
    height: 24,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.muted,
    color: colors.secondaryText,
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    color: colors.secondaryText,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  menuList: {
    flex: 1,
  },
  emptyCategoryText: {
    paddingHorizontal: 22,
    paddingVertical: 42,
    color: colors.secondaryText,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  dishRow: {
    minHeight: 116,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  dishRowSelected: {
    borderLeftColor: colors.primary,
    borderLeftWidth: 3,
    backgroundColor: '#fbfbfd',
  },
  dishCopy: {
    flex: 1,
    minWidth: 0,
  },
  dishName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  dishDescription: {
    marginTop: 4,
    color: colors.secondaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  dishPrice: {
    marginTop: 6,
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  addButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d7d9e2',
    backgroundColor: colors.muted,
  },
  addButtonText: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 28,
    fontWeight: '600',
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d7d9e2',
    backgroundColor: colors.muted,
    padding: 3,
  },
  qtyButtonMuted: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#dedfe6',
  },
  qtyButtonDark: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  qtyButtonText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  qtyButtonTextDark: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  qtyText: {
    minWidth: 28,
    textAlign: 'center',
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  tabletOrderPanel: {
    width: 360,
    flexGrow: 0,
    borderLeftColor: colors.border,
    borderLeftWidth: 1,
    backgroundColor: colors.card,
  },
  panelHeader: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 18,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  panelEyebrow: {
    color: colors.secondaryText,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  panelTitle: {
    marginTop: 3,
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  panelList: {
    flex: 1,
  },
  panelEmpty: {
    paddingHorizontal: 20,
    paddingVertical: 42,
    textAlign: 'center',
    color: colors.secondaryText,
    fontSize: 15,
    fontWeight: '700',
  },
  panelOrderRow: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  qtyControlCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d7d9e2',
    backgroundColor: colors.muted,
    padding: 3,
  },
  panelFooter: {
    padding: 18,
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  helpButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: '#2d2d31',
    shadowColor: '#000000',
    shadowOpacity: 0.24,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  helpText: {
    color: '#ffffff',
    fontSize: 26,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  orderSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '88%',
    maxWidth: 720,
    alignSelf: 'center',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  handle: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: colors.muted,
  },
  closeText: {
    color: colors.secondaryText,
    fontSize: 30,
    lineHeight: 32,
  },
  sheetTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  tableChip: {
    color: colors.secondaryText,
    fontSize: 13,
    fontWeight: '700',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.muted,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sheetList: {
    minHeight: 120,
    maxHeight: 420,
  },
  emptyText: {
    paddingVertical: 42,
    textAlign: 'center',
    color: colors.secondaryText,
    fontSize: 15,
    fontWeight: '600',
  },
  orderRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  orderName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  orderTotal: {
    minWidth: 76,
    textAlign: 'right',
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  sheetFooter: {
    padding: 18,
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  totalLabel: {
    color: colors.secondaryText,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  totalPrice: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  sendButton: {
    minHeight: 48,
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  sendButtonDisabled: {
    opacity: 0.65,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  clearButton: {
    marginTop: 12,
    textAlign: 'center',
    color: colors.secondaryText,
    fontSize: 13,
    fontWeight: '800',
  },
});
