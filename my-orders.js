                <p>Order ID: ${order.id}</p>
                <p>Items: ${itemNames.join(', ')}</p>
                <p>Status: <span class="status ${order.status}">${formatStatus(order.status)}</span></p>
                <p>Price: ${window.formatters?.currency ? window.formatters.currency(orderTotal, true) : `KSh ${orderTotal.toFixed(2)}`}</p> 