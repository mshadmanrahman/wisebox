<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Ticket;

class OrderFulfillmentService
{
    public function createFromOrder(Order $order, ?array $preferredTimeSlots = null): void
    {
        $order->loadMissing(['items.service']);

        if (!$order->property_id) {
            return;
        }

        foreach ($order->items as $item) {
            if (!$item->service_id) {
                continue;
            }

            $existing = Ticket::query()
                ->where('order_id', $order->id)
                ->where('service_id', $item->service_id)
                ->exists();

            if ($existing) {
                continue;
            }

            $serviceName = $item->service?->name ?? 'Service Request';
            $isConsultation = $this->isConsultationService($item->service?->name ?? '');

            // Build description with time slots if consultation
            $description = "Created from order {$order->order_number}";
            if ($isConsultation && !empty($preferredTimeSlots)) {
                $description .= "\n\nPreferred Time Slots:\n";
                foreach ($preferredTimeSlots as $index => $slot) {
                    $description .= sprintf("%d. %s\n", $index + 1, $slot['display']);
                }
            }

            Ticket::create([
                'ticket_number' => $this->generateTicketNumber(),
                'order_id' => $order->id,
                'property_id' => $order->property_id,
                'customer_id' => $order->user_id,
                'service_id' => $item->service_id,
                'title' => $serviceName,
                'description' => $description,
                'priority' => $isConsultation ? 'high' : 'medium',
                'status' => 'open',
                'preferred_time_slots' => $isConsultation ? $preferredTimeSlots : null,
            ]);
        }
    }

    private function isConsultationService(string $serviceName): bool
    {
        $serviceName = strtolower($serviceName);
        return str_contains($serviceName, 'consultation') || str_contains($serviceName, 'consult');
    }

    private function generateTicketNumber(): string
    {
        $year = now()->format('Y');
        $sequence = (Ticket::max('id') ?? 0) + 1;

        do {
            $ticketNumber = sprintf('TK-%s-%05d', $year, $sequence);
            $sequence++;
        } while (Ticket::query()->where('ticket_number', $ticketNumber)->exists());

        return $ticketNumber;
    }
}
