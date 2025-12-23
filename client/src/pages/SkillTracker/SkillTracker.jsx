import { useUser } from "../../context/UserContext";

export default function SkillTracker() {
  const { user } = useUser();

  return (
    <div className="p-6 space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Skill Tracker</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your skills grow automatically based on real work projects, updates,
          and mentorship.
        </p>
      </header>

      <section className="rounded-lg border p-6 bg-muted/30">
        <p className="text-sm text-muted-foreground">
          Skill analytics will appear here once activity is detected.
        </p>

        {user && (
          <p className="mt-2 text-xs text-muted-foreground">
            Viewing skills for <span className="font-medium">{user.name}</span>
          </p>
        )}
      </section>
    </div>
  );
}
