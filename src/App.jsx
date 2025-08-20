import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

export default function PronostiekApp() {
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useState("");
  const [riders, setRiders] = useState([]);
  const [teamNormaal, setTeamNormaal] = useState([]);
  const [teamPro, setTeamPro] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [competition, setCompetition] = useState("NORMAAL");
  const [saveMessage, setSaveMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [maxPointsFilter, setMaxPointsFilter] = useState(5000);
  const [minPoints, setMinPoints] = useState(0);
  const [maxPoints, setMaxPoints] = useState(5000);

  const currentTeam = competition === "NORMAAL" ? teamNormaal : teamPro;
  const setCurrentTeam = competition === "NORMAAL" ? setTeamNormaal : setTeamPro;
  const budgetLimit = competition === "NORMAAL" ? 11000 : 5500;
  const maxRiders = 15;
  const maxPerTeam = 4;

  const totalPoints = currentTeam.reduce((sum, r) => sum + r.Points, 0);
  const teamCounts = currentTeam.reduce((acc, r) => {
    acc[r.Team] = (acc[r.Team] || 0) + 1;
    return acc;
  }, {});

  useEffect(() => {
    fetch("/renners.json")
      .then((res) => res.json())
      .then((data) => {
        setRiders(data);
        const points = data.map((r) => r.Points);
        setMinPoints(Math.min(...points));
        setMaxPoints(Math.max(...points));
        setMaxPointsFilter(Math.max(...points));
      })
      .catch((err) => console.error("Fout bij laden renners:", err));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      const email = data?.session?.user?.email;
      if (!email || error) {
        navigate("/login");
      } else {
        setUserEmail(email);
        loadTeams(email);
      }
    });
  }, [navigate]);

  const loadTeams = async (email) => {
    const {
      data,
      error,
    } = await supabase.from("teams").select("*").eq("user_email", email);

    if (error && error.code === "401") {
      navigate("/login");
      return;
    }

    data?.forEach((team) => {
      if (team.competition === "NORMAAL") setTeamNormaal(team.team_data);
      if (team.competition === "PRO") setTeamPro(team.team_data);
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserEmail("");
    navigate("/login");
  };

  const saveTeamToSupabase = async () => {
    const cleanedName = teamName.toLowerCase().replace(/[^a-z0-9]/gi, "");
    const now = new Date();
    const fileSuffix = `${String(now.getDate()).padStart(2, "0")}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getFullYear()).slice(-2)}-${String(
      now.getHours()
    ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;

    const { error } = await supabase.from("teams").upsert({
      user_email: userEmail,
      team_name: `${cleanedName}-${competition.toLowerCase()}-${fileSuffix}`,
      competition,
      team_data: currentTeam,
    });

    if (error) {
      if (error.code === "401") {
        navigate("/login");
      } else {
        setSaveMessage("❌ Fout bij opslaan");
      }
    } else {
      setSaveMessage("✅ Je ploeg is opgeslagen!");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

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
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tour Pronostiek - {competition}</h1>
        <div className="space-x-2">
          <Button
            onClick={() => setCompetition("NORMAAL")}
            variant={competition === "NORMAAL" ? "default" : "outline"}
          >
            NORMAAL
          </Button>
          <Button
            onClick={() => setCompetition("PRO")}
            variant={competition === "PRO" ? "default" : "outline"}
          >
            PRO
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      <Input
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        placeholder="Teamnaam"
        className="mb-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold mb-2">
            Jouw ploeg ({totalPoints}/{budgetLimit})
          </h2>
          <ul className="space-y-1 mb-2">
            {currentTeam.map((r) => (
              <li key={r.Renner} className="flex justify-between">
                <span>
                  {r.Renner} ({r.Team})
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeRider(r.Renner)}
                >
                  Verwijder
                </Button>
              </li>
            ))}
          </ul>

          {isTeamValid ? (
            <Button onClick={saveTeamToSupabase}>✅ Bevestig ploeg</Button>
          ) : (
            <div className="text-red-600 font-bold mt-2">
              ❌ Ploeg nog niet in orde
              <ul className="list-disc list-inside text-sm font-normal mt-1">
                {currentTeam.length !== maxRiders && (
                  <li>
                    Je moet exact {maxRiders} renners selecteren (nu:{" "}
                    {currentTeam.length}).
                  </li>
                )}
                {totalPoints > budgetLimit && (
                  <li>
                    Je overschrijdt het budget van {budgetLimit} punten (nu:{" "}
                    {totalPoints}).
                  </li>
                )}
                {Object.values(teamCounts).some((c) => c > maxPerTeam) && (
                  <li>
                    Maximaal {maxPerTeam} renners per ploeg toegelaten.
                  </li>
                )}
                {teamName.trim().length === 0 && <li>Teamnaam is verplicht.</li>}
              </ul>
            </div>
          )}

          {saveMessage && <p className="mt-2">{saveMessage}</p>}
        </div>

        <div>
          <Input
            placeholder="Filter op naam"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-2"
          />
          <Input
            placeholder="Filter op ploeg"
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="mb-2"
          />
          <label className="text-sm">Filter op punten</label>
          <div className="flex items-center gap-2 mb-2">
            <span>{minPoints}</span>
            <input
              type="range"
              min={minPoints}
              max={maxPoints}
              step="10"
              value={maxPointsFilter}
              onChange={(e) => setMaxPointsFilter(Number(e.target.value))}
              className="flex-1"
            />
            <span>{maxPointsFilter}</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-auto">
            {filteredRiders.map((r) => (
              <Card key={r.Renner} className="p-2 flex justify-between items-center">
                <CardContent className="p-0">
                  <p className="font-semibold">{r.Renner}</p>
                  <p className="text-sm">{r.Team}</p>
                  <p className="text-sm">{r.Points} punten</p>
                </CardContent>
                <Button
                  disabled={!canAdd(r)}
                  onClick={() => setCurrentTeam([...currentTeam, r])}
                  className={!canAdd(r) ? "bg-gray-300 text-gray-600" : ""}
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
