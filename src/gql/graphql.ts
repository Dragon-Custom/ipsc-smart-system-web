/* eslint-disable */
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /**
   * The `BigInt` scalar type represents non-fractional signed whole numeric values.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
   */
  BigInt: { input: any; output: any; }
  /** The `Byte` scalar type represents byte value as a Buffer */
  Bytes: { input: any; output: any; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: any; output: any; }
  /** An arbitrary-precision Decimal type */
  Decimal: { input: any; output: any; }
  /** The `File` scalar type represents a file upload. */
  File: { input: any; output: any; }
  /** the base64 encoded file */
  FileOutput: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  Json: { input: any; output: any; }
};

export type BatchPayload = {
  __typename?: 'BatchPayload';
  count: Scalars['Int']['output'];
};

export type CreateScorelistInput = {
  scoreboardId: Scalars['Int']['input'];
  stageId: Scalars['Int']['input'];
};

export type CreateShooterShooterInput = {
  division: Division;
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type CreateStageInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  designerId: Scalars['Int']['input'];
  gunCondition: Scalars['Int']['input'];
  imageId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  noshoots: Scalars['Int']['input'];
  papers: Scalars['Int']['input'];
  poppers: Scalars['Int']['input'];
  tagsId?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** unit: minutes */
  walkthroughTime: Scalars['Float']['input'];
};

export type CreateStageTagInput = {
  color: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

/** Shooter's division */
export enum Division {
  Open = 'Open',
  Production = 'Production',
  ProductionOptics = 'ProductionOptics',
  Standard = 'Standard'
}

export type DqObject = Node & {
  __typename?: 'DqObject';
  category: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  /** the index on the rulebooks */
  index: Scalars['String']['output'];
  scores?: Maybe<Array<Maybe<Score>>>;
  title: Scalars['String']['output'];
};

export type DqObjectsFilterInput = {
  category?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  index?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type GlobalStatistic = {
  __typename?: 'GlobalStatistic';
  alphaZoneTotal?: Maybe<Scalars['Int']['output']>;
  averageAccuracy?: Maybe<Scalars['Float']['output']>;
  averageHitFactor?: Maybe<Scalars['Float']['output']>;
  charlieZoneTotal?: Maybe<Scalars['Int']['output']>;
  deltaZoneTotal?: Maybe<Scalars['Int']['output']>;
  dnfTotal?: Maybe<Scalars['Int']['output']>;
  dqTotal?: Maybe<Scalars['Int']['output']>;
  finishedTotal?: Maybe<Scalars['Int']['output']>;
  missTotal?: Maybe<Scalars['Int']['output']>;
  noShootTotal?: Maybe<Scalars['Int']['output']>;
  popperTotal?: Maybe<Scalars['Int']['output']>;
  proErrorTotal?: Maybe<Scalars['Int']['output']>;
  /** The run count of all shooter */
  runsTotal?: Maybe<Scalars['Int']['output']>;
  /** The number of shooter that join in */
  shootersTotal?: Maybe<Scalars['Int']['output']>;
  stagesTotal?: Maybe<Scalars['Int']['output']>;
};

export type GlobalStatisticFilterInputType = {
  scoreboardId?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  scorelistId?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  stageId?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export type Image = {
  __typename?: 'Image';
  id: Scalars['ID']['output'];
  stages?: Maybe<Array<Maybe<Stage>>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addRoundsToScorelist?: Maybe<Scorelist>;
  copyShootersFromRoundToRound?: Maybe<Scalars['Boolean']['output']>;
  createEmptyScore?: Maybe<Score>;
  createScoreboard?: Maybe<Scoreboard>;
  createScorelist?: Maybe<Scorelist>;
  /** create and return the new shooter */
  createShooter: Shooter;
  createStage?: Maybe<Stage>;
  /** create and return the new stage tag */
  createStageTag: StageTag;
  deleteScore?: Maybe<Score>;
  deleteScoreboard?: Maybe<Scoreboard>;
  deleteScorelist?: Maybe<Scorelist>;
  /** delete shooter, return true if success */
  deleteShooter?: Maybe<Shooter>;
  deleteStage?: Maybe<Stage>;
  deleteStageTag: Scalars['Boolean']['output'];
  setScoreDNF?: Maybe<Score>;
  setScoreDQ?: Maybe<Score>;
  swapScoresId?: Maybe<Scalars['Boolean']['output']>;
  updateScore?: Maybe<Score>;
  updateScoreboard?: Maybe<Scoreboard>;
  /** update and return the new shooter, return null if unfound */
  updateShooter?: Maybe<Shooter>;
  updateStage?: Maybe<Stage>;
  /** return the newest stage tag, if not found return null */
  updateStageTag?: Maybe<StageTag>;
  uploadImage?: Maybe<Scalars['ID']['output']>;
};


export type MutationAddRoundsToScorelistArgs = {
  id: Scalars['Int']['input'];
  rounds?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationCopyShootersFromRoundToRoundArgs = {
  destRound: Scalars['Int']['input'];
  scorelistId: Scalars['Int']['input'];
  srcRound: Scalars['Int']['input'];
};


export type MutationCreateEmptyScoreArgs = {
  round: Scalars['Int']['input'];
  scorelistId: Scalars['Int']['input'];
  shooterId: Scalars['Int']['input'];
};


export type MutationCreateScoreboardArgs = {
  name: Scalars['String']['input'];
};


export type MutationCreateScorelistArgs = {
  scorelist: CreateScorelistInput;
};


export type MutationCreateShooterArgs = {
  shooter: CreateShooterShooterInput;
};


export type MutationCreateStageArgs = {
  stage: CreateStageInput;
};


export type MutationCreateStageTagArgs = {
  stageTag: CreateStageTagInput;
};


export type MutationDeleteScoreArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteScoreboardArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteScorelistArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteShooterArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteStageArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteStageTagArgs = {
  id: Scalars['Int']['input'];
};


export type MutationSetScoreDnfArgs = {
  id: Scalars['Int']['input'];
};


export type MutationSetScoreDqArgs = {
  dqReasonId: Scalars['Int']['input'];
  id: Scalars['Int']['input'];
};


export type MutationSwapScoresIdArgs = {
  destId: Scalars['Int']['input'];
  srcId: Scalars['Int']['input'];
};


export type MutationUpdateScoreArgs = {
  id: Scalars['Int']['input'];
  score?: InputMaybe<UpdateScoreInput>;
};


export type MutationUpdateScoreboardArgs = {
  id: Scalars['Int']['input'];
  name: Scalars['String']['input'];
};


export type MutationUpdateShooterArgs = {
  id: Scalars['Int']['input'];
  shooter?: InputMaybe<UpdateShooterShooterInput>;
};


export type MutationUpdateStageArgs = {
  id: Scalars['Int']['input'];
  stage?: InputMaybe<UpdateStageInput>;
};


export type MutationUpdateStageTagArgs = {
  id: Scalars['Int']['input'];
  stageTag: UpdateStageTagInput;
};


export type MutationUploadImageArgs = {
  image: Scalars['File']['input'];
};

export type Node = {
  id: Scalars['Int']['output'];
};

export type ProErrorObject = Node & {
  __typename?: 'ProErrorObject';
  description: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  index: Scalars['String']['output'];
  proErrorsStore?: Maybe<Array<Maybe<ProErrorStore>>>;
  title: Scalars['String']['output'];
};

export type ProErrorObjectsFilterInput = {
  id?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  index?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ProErrorStore = Node & {
  __typename?: 'ProErrorStore';
  count: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  proError: ProErrorObject;
  score: Score;
};

export type Query = {
  __typename?: 'Query';
  dqObject?: Maybe<DqObject>;
  dqObjects?: Maybe<Array<Maybe<DqObject>>>;
  globalStatistic?: Maybe<GlobalStatistic>;
  historyRating?: Maybe<Array<Maybe<Rating>>>;
  image?: Maybe<Scalars['FileOutput']['output']>;
  proErrorObject?: Maybe<ProErrorObject>;
  proErrorObjects?: Maybe<Array<Maybe<ProErrorObject>>>;
  rating?: Maybe<Rating>;
  score?: Maybe<Score>;
  scoreboard?: Maybe<Scoreboard>;
  scoreboards: Array<Maybe<Scoreboard>>;
  scorelist?: Maybe<Scorelist>;
  scorelists?: Maybe<Array<Maybe<Scorelist>>>;
  shooter?: Maybe<Shooter>;
  shooterStatistic?: Maybe<ShooterStatistic>;
  shooters: Array<Maybe<Shooter>>;
  stage?: Maybe<Stage>;
  stageTag?: Maybe<StageTag>;
  stageTags?: Maybe<Array<Maybe<StageTag>>>;
  stages: Array<Maybe<Stage>>;
};


export type QueryDqObjectArgs = {
  id: Scalars['Int']['input'];
};


export type QueryDqObjectsArgs = {
  filter?: InputMaybe<DqObjectsFilterInput>;
};


export type QueryGlobalStatisticArgs = {
  filter?: InputMaybe<GlobalStatisticFilterInputType>;
};


export type QueryHistoryRatingArgs = {
  shooterId: Scalars['Int']['input'];
};


export type QueryImageArgs = {
  id: Scalars['String']['input'];
};


export type QueryProErrorObjectArgs = {
  id: Scalars['Int']['input'];
};


export type QueryProErrorObjectsArgs = {
  filter?: InputMaybe<ProErrorObjectsFilterInput>;
};


export type QueryRatingArgs = {
  shooterId: Scalars['Int']['input'];
};


export type QueryScoreArgs = {
  id: Scalars['Int']['input'];
};


export type QueryScoreboardArgs = {
  id: Scalars['Int']['input'];
};


export type QueryScorelistArgs = {
  id: Scalars['Int']['input'];
};


export type QueryShooterArgs = {
  id: Scalars['Int']['input'];
};


export type QueryShooterStatisticArgs = {
  shooterId: Scalars['Int']['input'];
};


export type QueryShootersArgs = {
  filter?: InputMaybe<ShootersFilter>;
};


export type QueryStageArgs = {
  id: Scalars['Int']['input'];
};


export type QueryStageTagArgs = {
  id: Scalars['Int']['input'];
};


export type QueryStageTagsArgs = {
  filter?: InputMaybe<StageTagsFilterInput>;
};


export type QueryStagesArgs = {
  filter?: InputMaybe<StageFilterInput>;
};

export type Ranking = Node & {
  __typename?: 'Ranking';
  createAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  rank: Scalars['Int']['output'];
  shooter: Shooter;
  shooterId: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Rating = Node & {
  __typename?: 'Rating';
  createAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  rating: Scalars['Float']['output'];
  shooter: Shooter;
  shooterId: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Score = Node & {
  __typename?: 'Score';
  accuracy: Scalars['Float']['output'];
  alphas: Scalars['Int']['output'];
  charlies: Scalars['Int']['output'];
  createAt: Scalars['DateTime']['output'];
  deltas: Scalars['Int']['output'];
  dqObjectId?: Maybe<Scalars['Int']['output']>;
  dqReason?: Maybe<DqObject>;
  hitFactor: Scalars['Float']['output'];
  id: Scalars['Int']['output'];
  misses: Scalars['Int']['output'];
  noshoots: Scalars['Int']['output'];
  overallPercentage: Scalars['Float']['output'];
  poppers: Scalars['Int']['output'];
  proErrorCount: Scalars['Int']['output'];
  proErrors?: Maybe<Array<Maybe<ProErrorStore>>>;
  round: Scalars['Int']['output'];
  roundPercentage: Scalars['Float']['output'];
  score: Scalars['Int']['output'];
  scorelist: Scorelist;
  scorelistId: Scalars['Int']['output'];
  shooter: Shooter;
  shooterId: Scalars['Int']['output'];
  state: ScoreState;
  time: Scalars['Float']['output'];
};

export enum ScoreState {
  Dq = 'DQ',
  DidNotFinish = 'DidNotFinish',
  DidNotScore = 'DidNotScore',
  Scored = 'Scored'
}

export type Scoreboard = Node & {
  __typename?: 'Scoreboard';
  createAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  lastUpdate: Scalars['DateTime']['output'];
  name: Scalars['String']['output'];
  scorelists?: Maybe<Array<Scorelist>>;
};

export type Scorelist = Node & {
  __typename?: 'Scorelist';
  createAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  lastUpdate: Scalars['DateTime']['output'];
  rounds: Scalars['Int']['output'];
  scoreboard: Scoreboard;
  scoreboardId: Scalars['Int']['output'];
  scores?: Maybe<Array<Maybe<Score>>>;
  stage: Stage;
  stageId: Scalars['Int']['output'];
};

export type Shooter = Node & {
  __typename?: 'Shooter';
  createAt: Scalars['DateTime']['output'];
  designedStage?: Maybe<Array<Maybe<Stage>>>;
  division: Division;
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  rankings?: Maybe<Array<Maybe<Ranking>>>;
  ratings?: Maybe<Array<Maybe<Rating>>>;
  scores?: Maybe<Array<Maybe<Score>>>;
};

export type ShooterStatistic = {
  __typename?: 'ShooterStatistic';
  alphaCount: Scalars['Float']['output'];
  averageAccuracy: Scalars['Float']['output'];
  averageHitFactor: Scalars['Float']['output'];
  charlieCount: Scalars['Float']['output'];
  deltaCount: Scalars['Float']['output'];
  dnfCount: Scalars['Float']['output'];
  dqCount: Scalars['Float']['output'];
  finishedCount: Scalars['Float']['output'];
  highestAccuracy: Scalars['Float']['output'];
  highestHitFactor: Scalars['Float']['output'];
  missCount: Scalars['Float']['output'];
  noShootCount: Scalars['Float']['output'];
  proErrorCount: Scalars['Float']['output'];
  runCount: Scalars['Float']['output'];
  shooterId: Scalars['Int']['output'];
};

export type ShootersFilter = {
  id?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export type Stage = Node & {
  __typename?: 'Stage';
  createAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  designer: Shooter;
  designerId: Scalars['Int']['output'];
  gunCondition: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  image: Image;
  maxScore: Scalars['Int']['output'];
  minRounds: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  noshoots: Scalars['Int']['output'];
  papers: Scalars['Int']['output'];
  poppers: Scalars['Int']['output'];
  scorelists?: Maybe<Array<Maybe<Scorelist>>>;
  stageType: StageType;
  tags?: Maybe<Array<Maybe<TagOnStage>>>;
  /** unit: minutes */
  walkthroughTime: Scalars['Float']['output'];
};

export type StageFilterInput = {
  id?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  stageType?: InputMaybe<Array<InputMaybe<StageType>>>;
  tagsName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type StageTag = Node & {
  __typename?: 'StageTag';
  /** format: rgba(x,x,x,x) */
  color: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export type StageTagsFilterInput = {
  id?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export enum StageType {
  Long = 'Long',
  Medium = 'Medium',
  Short = 'Short',
  Unsanctioned = 'Unsanctioned'
}

export type Subscription = {
  __typename?: 'Subscription';
  scoreboardsChange?: Maybe<Scalars['Boolean']['output']>;
  scorelistsChange?: Maybe<Scalars['Boolean']['output']>;
  scoresChange?: Maybe<Scalars['Boolean']['output']>;
  shootersChange?: Maybe<Scalars['Boolean']['output']>;
  stageTagsChange?: Maybe<Scalars['Boolean']['output']>;
  stagesChange?: Maybe<Scalars['Boolean']['output']>;
};

export type TagOnStage = Node & {
  __typename?: 'TagOnStage';
  id: Scalars['Int']['output'];
  tag: StageTag;
};

export type UpdateScoreInput = {
  alphas?: InputMaybe<Scalars['Int']['input']>;
  charlies?: InputMaybe<Scalars['Int']['input']>;
  deltas?: InputMaybe<Scalars['Int']['input']>;
  misses?: InputMaybe<Scalars['Int']['input']>;
  noshoots?: InputMaybe<Scalars['Int']['input']>;
  poppers?: InputMaybe<Scalars['Int']['input']>;
  proErrors?: InputMaybe<Array<UpdateScoreProErrorInput>>;
  round?: InputMaybe<Scalars['Int']['input']>;
  time?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateScoreProErrorInput = {
  count: Scalars['Int']['input'];
  proErrorId: Scalars['Int']['input'];
};

export type UpdateShooterShooterInput = {
  division?: InputMaybe<Division>;
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateStageInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  designerId?: InputMaybe<Scalars['Int']['input']>;
  gunCondition?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  imageId?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  noshoots?: InputMaybe<Scalars['Int']['input']>;
  papers?: InputMaybe<Scalars['Int']['input']>;
  poppers?: InputMaybe<Scalars['Int']['input']>;
  tagsId?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** unit: minutes */
  walkthroughTime?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateStageTagInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};
