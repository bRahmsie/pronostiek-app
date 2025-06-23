import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

export default function PronostiekApp() {
  const [riders, setRiders] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [teamNormaal, setTeamNormaal] = useState([]);
  const [teamPro, setTeamPro] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [competition, setCompetition] = useState("NORMAAL");
  const [searchTerm, setSearchTerm] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [maxPointsFilter, setMaxPointsFilter] = useState(5000);
  const [minPoints, setMinPoints] = useState(0);
  const [maxPoints, setMaxPoints] = useState(5000);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/renners.json")
      .then((res) => {
        if (!res.ok) throw new Error("Netwerkfout");
        return res.json();
      })
      .then((data) => {
        setRiders(data);
        const points = data.map((r) => r.Points);
        setMinPoints(Math.min(...points));
        setMaxPoints(Math.max(...points));
        setMaxPointsFilter(Math.max(...points));
      })
      .catch((err) => console.error("Fout bij laden renners:", err));
  }, []);

  const currentTeam = competition === "NORMAAL" ? teamNormaal : teamPro;
  const setCurrentTeam = competition === "NORMAAL" ? setTeamNormaal : setTeamPro;
  const budgetLimit = competition === "NORMAAL" ? 12000 : 6000;

  const totalPoints = currentTeam.reduce((sum, r) => sum + r.Points, 0);
  const teamCounts = currentTeam.reduce((acc, r) => {
    acc[r.Team] = (acc[r.Team] || 0) + 1;
    return acc;
  }, {});
  const maxRiders = 15;
  const maxPerTeam = 4;

  const canAdd = (r) => {
    if (currentTeam.find((t) => t.Renner === r.Renner)) return false;
    if (currentTeam.length >= maxRiders) return false;
    if (totalPoints + r.Points > budgetLimit) return false;
    if ((teamCounts[r.Team] || 0) >= maxPerTeam) return false;
    return true;
  };

  const removeRider = (renner) => {
    setCurrentTeam(currentTeam.filter((r) => r.Renner !== renner));
  };

  const isTeamValid =
    currentTeam.length === maxRiders &&
    totalPoints <= budgetLimit &&
    Object.values(teamCounts).every((c) => c <= maxPerTeam) &&
    teamName.trim().length > 0;

  const filteredRiders = riders.filter(
    (r) =>
      typeof r.Renner === "string" &&
      typeof r.Team === "string" &&
      r.Renner.toLowerCase().includes(searchTerm.toLowerCase()) &&
      r.Team.toLowerCase().includes(teamFilter.toLowerCase()) &&
      r.Points <= maxPointsFilter
  );

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <Input
        placeholder="Filter op ploegnaam"
        value={teamFilter}
        onChange={(e) => setTeamFilter(e.target.value)}
        className="mb-2"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-bold mb-2">Jouw ploeg</h2>
          <ul className="mb-2">
            {currentTeam.map((r) => (
              <li key={r.Renner} className="flex justify-between">
                <span>{r.Renner}</span>
                <Button size="sm" variant="outline" onClick={() => removeRider(r.Renner)}>Verwijder</Button>
              </li>
            ))}
          </ul>
          {isTeamValid ? (
            <p className="text-green-600 font-bold mt-2">✅ Je ploeg is in orde!</p>
          ) : (
            <div className="text-red-600 font-bold mt-2">
              ❌ Ploeg nog niet in orde
              <ul className="list-disc list-inside text-sm font-normal mt-1">
                {currentTeam.length !== maxRiders && (
                  <li>Je moet exact {maxRiders} renners selecteren (nu: {currentTeam.length}).</li>
                )}
                {totalPoints > budgetLimit && (
                  <li>Je overschrijdt het budget van {budgetLimit} punten (nu: {totalPoints}).</li>
                )}
                {Object.values(teamCounts).some(c => c > maxPerTeam) && (
                  <li>Maximaal {maxPerTeam} renners per team toegelaten.</li>
                )}
                {teamName.trim().length === 0 && (
                  <li>Teamnaam is verplicht.</li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">Beschikbare renners</h2>
          <div className="space-y-2">
            {filteredRiders.map((r) => (
              <Card key={r.Renner} className="p-2 flex justify-between items-center">
                <CardContent className="p-0">
                  <div>
                    <p className="font-semibold">{r.Renner}</p>
                    <p className="text-sm text-muted">{r.Team}</p>
                    <p className="text-sm">{r.Points} punten</p>
                  </div>
                </CardContent>
                <Button
                  disabled={!canAdd(r)}
                  onClick={() => setCurrentTeam([...currentTeam, r])}
                  className={!canAdd(r) ? "bg-gray-300 text-gray-600 cursor-not-allowed" : ""}
                >
                  Voeg toe
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
