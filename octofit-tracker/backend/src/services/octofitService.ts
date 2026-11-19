import { isObjectIdOrHexString } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function isObjectIdString(value: unknown): value is string {
  return typeof value === 'string' && isObjectIdOrHexString(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (
    typeof input !== 'object' || input === null ||
    !('userId' in input) || !('teamId' in input) || !('type' in input) || !('minutes' in input)
  ) {
    throw Object.assign(new Error('Informe a pessoa, a equipe, o tipo e a duração da atividade.'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input;
  if (!isObjectIdString(userId) || !isObjectIdString(teamId)) {
    throw Object.assign(new Error('Informe identificadores válidos para a pessoa e a equipe.'), { status: 400 });
  }
  if (typeof type !== 'string' || !type.trim() || typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw Object.assign(new Error('Informe um tipo de atividade e uma duração em minutos maior que zero.'), { status: 400 });
  }

  const [user, team] = await Promise.all([User.exists({ _id: userId }), Team.exists({ _id: teamId })]);
  if (!user || !team) {
    throw Object.assign(new Error('Pessoa ou equipe não encontrada.'), { status: 404 });
  }

  return Activity.create({ user: userId, team: teamId, type, minutes, points: minutes, occurredAt: new Date() });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (
    typeof input !== 'object' || input === null ||
    !('name' in input) || typeof input.name !== 'string' || !input.name.trim() ||
    !('mascot' in input) || typeof input.mascot !== 'string' || !input.mascot.trim()
  ) {
    throw Object.assign(new Error('Informe o nome e o mascote da equipe.'), { status: 400 });
  }

  const { name, mascot } = input;
  const members = 'members' in input ? input.members : [];
  if (!Array.isArray(members) || !members.every(isObjectIdString)) {
    throw Object.assign(new Error('Informe uma lista de identificadores válidos para os integrantes.'), { status: 400 });
  }

  const memberIds = [...new Set(members.map((id) => id.toLowerCase()))];
  if (memberIds.length && await User.countDocuments({ _id: { $in: memberIds } }) !== memberIds.length) {
    throw Object.assign(new Error('Um ou mais integrantes da equipe não foram encontrados.'), { status: 404 });
  }

  return Team.create({ name, mascot, members });
}

export async function getLeaderboard() {
  const standings = await Activity.aggregate<{ teamName: string; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $lookup: { from: Team.collection.name, localField: '_id', foreignField: '_id', as: 'team' } },
    { $unwind: '$team' },
    { $project: { _id: 0, teamId: '$_id', teamName: '$team.name', totalPoints: 1 } },
    { $sort: { totalPoints: -1, teamName: 1, teamId: 1 } },
    { $unset: 'teamId' },
  ]);
  return standings.map((standing, index) => ({ ...standing, rank: index + 1 }));
}

const focusByActivity = new Map([
  ['run', 'endurance'],
  ['walk', 'endurance'],
  ['cycle', 'endurance'],
  ['strength', 'strength'],
  ['mobility', 'mobility'],
]);

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).select('fitnessGoal').lean();
  if (!user) {
    throw Object.assign(new Error('Pessoa não encontrada para o e-mail informado.'), { status: 404 });
  }

  const latestActivity = await Activity.findOne({ user: user._id, type: { $in: [...focusByActivity.keys()] } })
    .sort({ occurredAt: -1, _id: -1 }).select('type').lean();
  const activityFocus = latestActivity ? focusByActivity.get(latestActivity.type) : undefined;
  const focuses = activityFocus ? [activityFocus, user.fitnessGoal] : [user.fitnessGoal];
  const workouts = await Workout.find({ focus: { $in: focuses } }).sort({ title: 1, _id: 1 }).lean();

  return workouts
    .sort((a, b) => Number(b.focus === activityFocus) - Number(a.focus === activityFocus))
    .map((workout) => ({
      ...workout,
      reason: workout.focus === activityFocus
        ? 'Este treino combina com sua atividade física recente.'
        : 'Este treino combina com sua meta de atividade física.',
    }));
}

export { User };
