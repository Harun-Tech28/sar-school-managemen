export default function ExamsPage() {
  return (
    <div className="container mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Exam Management</h1>
        <p className="text-muted-foreground">Schedule exams, manage results, and analyze performance</p>
      </header>
      
      <main className="space-y-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Exam Scheduling</h2>
          <p className="text-muted-foreground">Coming Soon: Create and schedule exams for different classes</p>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Results Management</h2>
          <p className="text-muted-foreground">Coming Soon: Enter and manage exam results</p>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Exam Analysis</h2>
          <p className="text-muted-foreground">Coming Soon: Analyze exam performance and trends</p>
        </div>
      </main>
    </div>
  )
}
