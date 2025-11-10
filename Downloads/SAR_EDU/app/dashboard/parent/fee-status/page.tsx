export default function FeeStatusPage() {
  return (
    <div className="container mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Fee Status</h1>
        <p className="text-muted-foreground">View school fees, payments, and balances</p>
      </header>
      
      <main className="space-y-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Current Balance</h2>
          <p className="text-muted-foreground">Coming Soon: View outstanding fees and balances</p>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Payment History</h2>
          <p className="text-muted-foreground">Coming Soon: View all payment transactions</p>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Make Payment</h2>
          <p className="text-muted-foreground">Coming Soon: Pay school fees online</p>
        </div>
      </main>
    </div>
  )
}
