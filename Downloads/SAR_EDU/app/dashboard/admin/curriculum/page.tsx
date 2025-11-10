export default function CurriculumPage() {
  return (
    <div className="container mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Ghana NaCCA Curriculum</h1>
        <p className="text-muted-foreground">Curriculum management and subject mapping</p>
      </header>
      
      <main className="space-y-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Curriculum Management</h2>
          <p className="text-muted-foreground">Coming Soon: Manage curriculum aligned with Ghana NaCCA standards</p>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Subject Mapping</h2>
          <p className="text-muted-foreground">Coming Soon: Map subjects to curriculum standards</p>
        </div>
      </main>
    </div>
  )
}
