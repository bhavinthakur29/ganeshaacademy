-- Notify instructor when order status changes
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_auth_id uuid;
  v_order_num text;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.instructor_id IS NOT NULL THEN
    SELECT auth_id INTO v_auth_id FROM public.instructors WHERE id = NEW.instructor_id;
    v_order_num := COALESCE(NEW.order_number::text, NEW.id::text);
    IF v_auth_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, message, metadata, is_read)
      VALUES (
        v_auth_id,
        'order',
        'Order ' || v_order_num || ' status updated to ' || COALESCE(NEW.status, '') || '.',
        jsonb_build_object('order_id', NEW.id, 'order_number', NEW.order_number, 'status', NEW.status),
        false
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS orders_status_change ON public.orders;
CREATE TRIGGER orders_status_change
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_status_change();
